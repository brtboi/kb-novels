import { TemplateCard } from "./editTypes";
import classNames from "classnames";
import styles from "./editStyles.module.css";
import EditTemplateCategory from "./EditTemplateCategory";
import { useContext } from "react";
import { EditContext } from "../../entity/contexts";



export default function EditTemplate() {
    const {templateRef, rerender} = useContext(EditContext)!

    const handleNewCategory = () => {
        templateRef.current!.categories.push({
            _dependencies: [],
            _isOrdered: false,
            _isSequential: false,
            name: `Category_${templateRef.current!.categories.length}`,
            rows: [],
        })
        

        rerender();
    };

    return (
        <div>
            {templateRef.current!.categories.map(
                (category, index) => (
                    <EditTemplateCategory category={category} index={index} key={`${category.name} | ${index}`}/>
                )
            )}
            <button onClick={handleNewCategory}>new Category</button>
        </div>
    );
}
