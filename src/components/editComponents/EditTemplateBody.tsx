import EditTemplateCategory from "./EditTemplateCategory";
import { useContext } from "react";
import { EditContext } from "../../entity/contexts";

export default function EditTemplateBody() {
    const { templateRef, rerender } = useContext(EditContext)!;

    const handleAddCategory = () => {
        templateRef.current!.categories.push({
            _dependencies: [],
            _isOrdered: false,
            _isSequential: false,
            name: `Category_${templateRef.current!.categories.length}`,
            rows: [],
        });

        rerender();
    };

    return (
        <div>
            {templateRef.current!.categories.map((category, index) => (
                <EditTemplateCategory
                    index={index}
                    key={`${category.name} | ${index}`}
                />
            ))}
            <button onClick={handleAddCategory}>add Category</button>
        </div>
    );
}
