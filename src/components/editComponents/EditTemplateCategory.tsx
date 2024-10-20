import classNames from "classnames";
import { TemplateCategory } from "./editTypes";
import styles from "./editStyles.module.css";
import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";

interface Props {
    category: TemplateCategory;
    index: number;
}

export default function EditTemplateCategory({ index }: Props) {
    const { templateRef, rerender } = useContext(EditContext)!;
    const [category, setCategory] = useState<TemplateCategory>(templateRef.current!.categories[index])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;

        setCategory((prev) => ({...prev, name: value}))

        templateRef.current!.categories[index] = { ...category, name: value };
    };

    return (
        <div className={classNames(styles.TemplateCategory)}>
            <input
                type="text"
                value={category.name}
                autoComplete="off"
                spellCheck="false"
                onChange={handleChange}
            />
            <p>{category.name}</p>
            <p>dependencies: {category._dependencies}</p>
            <p>isOrdered: {category._isOrdered.toString()}</p>
            <p>rows:</p>
            {category.rows.map(({ label, _type, _isCaseSensitive }) => (
                <p>{label}</p>
            ))}

            <button></button>
        </div>
    );
}
