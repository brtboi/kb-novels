import React, {
    useState,
    useEffect,
    useRef,
    createRef,
    useCallback,
} from "react";
import { Card, CardRow, STATE } from "../../entity/types.ts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase.ts";
import { useParams } from "react-router-dom";
import InputCategory from "./InputCategory.tsx";
import classNames from "classnames";
import styles from "./inputStyles.module.scss";
import SettingsOverlay from "./SettingsOverlay.tsx";

type Suit = 0 | 1 | 2 | 3;

type DrawPileItem = {
    cardIndex: number;
    suit: Suit;
    suitIndex: number;
};

interface CaretData {
    active: boolean;
    top: number;
    left: number;
}

export default function DeckPage() {
    const { deckId } = useParams<{ deckId: string }>();

    const [isFirstLoaded, setIsFirstLoaded] = useState<boolean>(false);

    const [cards, setCards] = useState<Card[] | null>(null);
    const [template, setTemplate] = useState<Card | null>(null);
    const [cardIndex, setCardIndex] = useState<number>(0);
    const cardSuits = useRef<number[][]>([[], [], [], []]);

    const drawPile = useRef<DrawPileItem[]>([]);
    const cardPerformance = useRef<-1 | 0 | 1>(1);

    const inputRefs = useRef<
        Record<string, React.RefObject<HTMLInputElement>[]>
    >({});
    const _isSequential = useRef<Record<string, boolean>>({});
    const _dependencies = useRef<Record<string, string[]>>({});

    const [rowStates, setRowStates] = useState<Record<string, STATE[]>>({});
    const [categorySettings, setCategorySettings] = useState<
        Record<string, STATE>
    >({});
    const [isSettings, setIsSettings] = useState<boolean>(false);

    const [isCardDone, setIsCardDone] = useState<boolean>(false);

    const [caretData, setCaretData] = useState<CaretData>({
        active: false,
        top: 0,
        left: 0,
    });
    const rem = parseFloat(
        window.getComputedStyle(document.documentElement).fontSize
    );
    const fontWidth = (rem * 13.203) / 16;

    const moveCard = (fromSuit: Suit, suitIndex: number, toSuit: Suit) => {
        const [cardIndex] = cardSuits.current[fromSuit].splice(suitIndex, 1);
        cardSuits.current[toSuit].push(cardIndex);
    };

    const getFlatIndex = useCallback(
        (categoryID: string, rowIndex: number) => {
            let index = 0;

            for (const category of cards![cardIndex].categories) {
                if (category._ID === categoryID) {
                    index += rowIndex;
                    break;
                }

                index += category.rows.length;
            }

            return index;
        },
        [cards, cardIndex]
    );

    const getIsAnswerCorrect = useCallback((value: string, row: CardRow) => {
        if (row._type === "name") {
            const allPossibleNames = [];

            for (const name of row.answers) {
                const words = name.trim().split(/\s+/); // Split full name into words

                // Generate all viable "last names" for this full name
                for (let i = 1; i <= words.length; i++) {
                    allPossibleNames.push(words.slice(-i).join(" "));
                }
            }

            return allPossibleNames.some((e) =>
                row._isCaseSensitive
                    ? e === value
                    : e.toUpperCase() === value.toUpperCase()
            );
        } else if (row._type === "text") {
            return row.answers.some((e) =>
                row._isCaseSensitive
                    ? e === value
                    : e.toUpperCase() === value.toUpperCase()
            );
        } else if (row._type === "number") {
            return row.answers.some((e) => parseFloat(e) === parseFloat(value));
        }
    }, []);

    const moveCaret = (element: HTMLInputElement) => {
        setTimeout(() => {
            const rect = element.getBoundingClientRect();
            setCaretData({
                active: true,
                top: rect.top,
                left: rect.left + (element.selectionStart || 0) * fontWidth,
            });
        }, 2);
    };

    const updateRowState = (
        categoryID: string,
        rowIndex: number,
        newState: STATE
    ) => {
        setRowStates((prev) => {
            const updatedRowStates = structuredClone(prev);
            const updatedRowStatesCategory = [...prev[categoryID]!];

            updatedRowStatesCategory[rowIndex] = newState;

            updatedRowStates[categoryID] = updatedRowStatesCategory;
            return updatedRowStates;
        });
        checkIsSequential();
        checkDependencies();
    };

    const handleOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        moveCaret(event.target);
    };

    const handleOnBlur = () => {
        setCaretData((prev) => ({
            ...prev,
            active: false,
        }));
    };

    const handleOnClick = (
        event: React.MouseEvent<HTMLInputElement, MouseEvent>
    ) => {
        moveCaret(event.currentTarget);
    };

    const handleOnKeyDown = (
        categoryID: string,
        rowIndex: number,
        event: React.KeyboardEvent<HTMLInputElement>,
        row: CardRow
    ) => {
        const value = event.currentTarget.value;
        switch (event.key) {
            case "Enter":
                event.preventDefault();
                const isAnswerCorrect = getIsAnswerCorrect(value, row);

                if (value === "") {
                    focusNextInput(categoryID, rowIndex, 1, false);
                    //
                } else if (isAnswerCorrect) {
                    inputRefs.current[categoryID][rowIndex].current!.value = "";
                    updateRowState(categoryID, rowIndex, STATE.CORRECT);

                    focusNextInput(categoryID, rowIndex, 1, isAnswerCorrect);
                    //
                } else if (value === "idk") {
                    inputRefs.current[categoryID][rowIndex].current!.value = "";
                    cardPerformance.current = -1;
                    updateRowState(categoryID, rowIndex, STATE.INCORRECT);
                    focusNextInput(categoryID, rowIndex, 1, true);
                    //
                } else {
                    cardPerformance.current = 0;
                    inputRefs.current[categoryID][rowIndex].current?.select();
                }

                break;

            case "ArrowUp":
                event.preventDefault();
                focusNextInput(categoryID, rowIndex, -1, false);
                break;

            case "ArrowDown":
                event.preventDefault();
                focusNextInput(categoryID, rowIndex, 1, false);
                break;

            default:
                moveCaret(event.currentTarget);
        }
    };

    const checkIsSequential = useCallback(() => {
        if (!cards) {
            console.error("Error: cards is null");
            return;
        }

        setRowStates((prev) => {
            const updatedRowStates = structuredClone(prev);

            for (const category of cards[cardIndex].categories) {
                if (category._isSequential) {
                    const states = updatedRowStates[category._ID];

                    for (let i = 1; i < states.length; i++) {
                        if (
                            states[i] === STATE.HIDE &&
                            (states[i - 1] === STATE.CORRECT ||
                                states[i - 1] === STATE.INCORRECT)
                        ) {
                            const _rowStatesTemp = [...prev[category._ID]];
                            _rowStatesTemp[i] = STATE.ASK;

                            updatedRowStates[category._ID] = _rowStatesTemp;
                            break;
                        }
                    }
                }
            }

            return updatedRowStates;
        });
    }, [cards, cardIndex]);

    const checkDependencies = useCallback(() => {
        if (!cards) {
            console.error("Error: cards is null");
            return;
        }

        setRowStates((prev) => {
            const updatedRowStates = structuredClone(prev);

            //Record<categoryID, boolean>
            const categoryStates = Object.entries(prev).reduce(
                (acc, [categoryID, states]) => ({
                    ...acc,
                    [categoryID]: states.every(
                        (e) => e !== STATE.ASK && e !== STATE.HIDE
                    ),
                }),
                {} as Record<string, boolean>
            );

            for (const category of cards[cardIndex].categories) {
                const isDependeniesFulfilled = _dependencies.current[
                    category._ID
                ].every((dependencyID) => categoryStates[dependencyID]);

                // if the category is currently hidden and all of it's dependencies are fulfilled
                if (
                    isDependeniesFulfilled &&
                    prev[category._ID]?.every((state) => state === STATE.HIDE)
                ) {
                    if (category._isSequential) {
                        updatedRowStates[category._ID] = prev[category._ID].map(
                            (_, i) => (i === 0 ? STATE.ASK : STATE.HIDE)
                        );
                    } else {
                        updatedRowStates[category._ID] = prev[category._ID].map(
                            () => STATE.ASK
                        );
                    }

                    // if the category isn't STATE.SHOW not STATE.DISABLE and dependencies aren't fulfilled
                } else if (
                    !isDependeniesFulfilled &&
                    !prev[category._ID]?.every(
                        (state) =>
                            state === STATE.SHOW || state === STATE.DISABLE
                    )
                ) {
                    updatedRowStates[category._ID] = prev[category._ID].map(
                        () => STATE.HIDE
                    );
                }
            }

            return updatedRowStates;
        });
    }, [cards, cardIndex]);

    const changeCategorySettings = useCallback(
        (categoryID: string, newState: STATE) => {
            setCategorySettings((prevCategorySettings) => {
                const _updatedCategorySettings =
                    structuredClone(prevCategorySettings);
                _updatedCategorySettings[categoryID] = newState;

                if (
                    cards &&
                    !cards[cardIndex].categories.some(
                        (category) => category._ID === categoryID
                    )
                ) {
                    return _updatedCategorySettings;
                }

                setRowStates((prevRowStates) => {
                    const _updatedRowStates = structuredClone(prevRowStates);

                    switch (newState) {
                        case STATE.ASK:
                            _updatedRowStates[categoryID] = prevRowStates[
                                categoryID
                            ].map((_) => STATE.HIDE);
                            break;

                        case STATE.SHOW:
                            _updatedRowStates[categoryID] = prevRowStates[
                                categoryID
                            ].map((_) => STATE.SHOW);
                            break;

                        case STATE.DISABLE:
                            _updatedRowStates[categoryID] = prevRowStates[
                                categoryID
                            ].map((_) => STATE.DISABLE);
                    }

                    return _updatedRowStates;
                });

                return _updatedCategorySettings;
            });

            setTimeout(() => {
                checkIsSequential();
                checkDependencies();
            });
        },
        [cards, cardIndex, checkDependencies, checkIsSequential]
    );

    const focusNextInput = useCallback(
        (
            categoryID: string,
            rowIndex: number,
            step: -1 | 1,
            isRowAnswered: boolean
        ) => {
            const inputRefsFlat = Array.from(
                Object.values(inputRefs.current)
            ).flat();

            setRowStates((prev) => {
                const flatIndex = getFlatIndex(categoryID, rowIndex);
                const rowStatesFlat = Array.from(Object.values(prev)).flat();

                let nextIndex =
                    (flatIndex + inputRefsFlat.length + step) %
                    inputRefsFlat.length;

                while (
                    nextIndex !== flatIndex &&
                    rowStatesFlat[nextIndex] !== STATE.ASK
                ) {
                    console.log("in the while loop");
                    nextIndex =
                        (nextIndex + inputRefsFlat.length + step) %
                        inputRefsFlat.length;
                }

                if (nextIndex === flatIndex && isRowAnswered) {
                    setTimeout(() => {
                        setIsCardDone(true);
                    }, 10);
                }

                setTimeout(() => {
                    inputRefsFlat[nextIndex].current?.focus();
                });
                return prev;
            });
        },
        [getFlatIndex]
    );

    const refillDrawPile = useCallback(() => {
        // move 5 cards to diamonds to clubs
        while (
            cardSuits.current[0].length > 0 &&
            cardSuits.current[1].length < 5
        ) {
            const randomIndex = Math.floor(
                Math.random() * cardSuits.current[0].length
            );

            moveCard(0, randomIndex, 1);
        }

        // refill drawPile with diamonds, hearts, and 5 cards from spades
        if (drawPile.current.length === 0) {
            const suit3Cards: DrawPileItem[] = [];

            while (
                suit3Cards.length < Math.min(5, cardSuits.current[3].length)
            ) {
                const randomIndex = Math.floor(
                    Math.random() * cardSuits.current[3].length
                );
                suit3Cards.push({
                    cardIndex: cardSuits.current[3][randomIndex],
                    suit: 3,
                    suitIndex: randomIndex,
                });
            }

            drawPile.current.push(
                ...suit3Cards,
                ...cardSuits.current[2].map((cardIndex, suitIndex) => ({
                    cardIndex: cardIndex,
                    suit: 2 as Suit,
                    suitIndex: suitIndex,
                })),
                ...cardSuits.current[1].map((cardIndex, suitIndex) => ({
                    cardIndex: cardIndex,
                    suit: 1 as Suit,
                    suitIndex: suitIndex,
                }))
            );
        }
    }, []);

    const getNextCard = useCallback(() => {
        setIsCardDone(false);
        if (drawPile.current.length === 0) refillDrawPile();
        else {
            const currentCard = drawPile.current.pop()!;

            const toSuit =
                currentCard.suitIndex + cardPerformance.current < 1
                    ? 1
                    : currentCard.suitIndex + cardPerformance.current > 3
                    ? 3
                    : ((currentCard.suitIndex +
                          cardPerformance.current) as Suit);

            moveCard(currentCard.suit, currentCard.suitIndex, toSuit);

            if (drawPile.current.length === 0) refillDrawPile();

            setCardIndex(drawPile.current[0].cardIndex);
            cardPerformance.current = 1;
        }

        // setCardIndex(Math.floor(cards!.length * Math.random()));
    }, [refillDrawPile]);

    // fetch Cards % template from firestore and initialize cardSuits[0]
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const docSnapshot = await getDoc(doc(db, `decks/${deckId}`));
                const cards = JSON.parse(docSnapshot.data()?.cards) as Card[];
                setCards(cards);

                const template = JSON.parse(
                    docSnapshot.data()?.template
                ) as Card;
                setTemplate(template);
                setCategorySettings(
                    template.categories.reduce(
                        (acc, category) => ({
                            ...acc,
                            [category._ID]: STATE.ASK,
                        }),
                        {}
                    )
                );

                // puts indices 0 to nCards - 1 into box0
                cardSuits.current[0] = cards.map((_, i) => i);
                getNextCard();
            } catch (e) {
                console.error("Error fetching CARDS", e);
            }
        };

        fetchCards();
    }, [deckId, getNextCard]);

    // Initialize inputRefs & rowStates & _dependencies & _isSequential
    useEffect(() => {
        if (cards) {
            const _inputRefs: Record<
                string,
                React.RefObject<HTMLInputElement>[]
            > = {};
            const _rowStates: Record<string, STATE[]> = {};

            cards[cardIndex].categories.forEach((category) => {
                _inputRefs[category._ID] = category.rows.map(() =>
                    createRef<HTMLInputElement>()
                );

                _rowStates[category._ID] = category.rows.map(() => STATE.HIDE);

                _dependencies.current[category._ID] = category._dependencies;
                _isSequential.current[category._ID] = category._isSequential;
            });

            inputRefs.current = _inputRefs;
            setRowStates(_rowStates);
            checkDependencies();

            setIsFirstLoaded(true);
        }
    }, [cards, cardIndex, checkDependencies]);

    // Focus First input
    useEffect(() => {
        if (isFirstLoaded && cards !== null) {
            const lastCategory =
                cards[cardIndex].categories[
                    cards[cardIndex].categories.length - 1
                ];
            focusNextInput(
                lastCategory._ID,
                lastCategory.rows.length - 1,
                1,
                false
            );
            setIsFirstLoaded(false);
        }
    }, [cardIndex, cards, focusNextInput, isFirstLoaded]);

    // global key down event listener for enter
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && cards) {
                setIsSettings((prev) => {
                    //focus first input when exit settings overlay
                    setTimeout(() => {
                        focusNextInput(
                            cards[cardIndex].categories[
                                cards[cardIndex].categories.length - 1
                            ]._ID,
                            cards[cardIndex].categories[
                                cards[cardIndex].categories.length - 1
                            ].rows.length - 1,
                            1,
                            false
                        );
                    }, 2);

                    return !prev;
                });
            } else if (e.key === "Enter" && isCardDone) {
                getNextCard();
            }
        };

        document.addEventListener("keydown", handleGlobalKeyDown);
        return () =>
            document.removeEventListener("keydown", handleGlobalKeyDown);
    });

    return (
        <>
            {cards !== null &&
            template !== null &&
            Object.keys(inputRefs.current).length !== 0 &&
            Object.keys(rowStates).length !== 0 ? (
                <div className={classNames(styles.InputBody)}>
                    {cards[cardIndex].categories.map(
                        (category, categoryIndex) => {
                            return (
                                <InputCategory
                                    category={category}
                                    inputRefs={inputRefs.current[category._ID]}
                                    rowStates={rowStates[category._ID]}
                                    handleOnFocus={handleOnFocus}
                                    handleOnBlur={handleOnBlur}
                                    handleOnClick={handleOnClick}
                                    handleKeyDown={(
                                        rowIndex: number,
                                        event: React.KeyboardEvent<HTMLInputElement>,
                                        row: CardRow
                                    ) => {
                                        handleOnKeyDown(
                                            category._ID,
                                            rowIndex,
                                            event,
                                            row
                                        );
                                    }}
                                    key={`category ${categoryIndex}`}
                                />
                            );
                        }
                    )}

                    <button onClick={getNextCard}>next Card</button>

                    <button
                        onClick={() => {
                            console.log(rowStates);
                        }}
                    >
                        rowStates
                    </button>

                    <div
                        className={classNames(styles.Caret)}
                        style={{
                            opacity: caretData.active ? 100 : 0,
                            top: caretData.top,
                            left: caretData.left,
                        }}
                    />

                    <SettingsOverlay
                        isSettings={isSettings}
                        template={template}
                        categorySettings={categorySettings}
                        changeCategorySettings={changeCategorySettings}
                    />
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </>
    );
}
