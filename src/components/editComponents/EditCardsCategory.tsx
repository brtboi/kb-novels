import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";
import { CardCategory } from "../../entity/types";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import EditCardsRow from "./EditCardsRow";

interface Props {
    cardIndex: number;
    categoryIndex: number;
}

export default function EditCardsCategory({ cardIndex, categoryIndex }: Props) {
    const { cardsRef } = useContext(EditContext)!;

    const [category, setCategory] = useState<CardCategory>(
        cardsRef.current![cardIndex].categories[categoryIndex]
    );



    return (
        <div className={classNames(styles.CardCategory)}>
            <p>{category.name}</p>
            {category.rows.map((row, rowIndex) => (
                <EditCardsRow category={category} rowIndex={rowIndex} key={`cat ${category.name} row ${rowIndex}`}/>
            ))}
        </div>
    );
}
