import EditTemplateCategory from "./EditTemplateCategory";
import { useContext, useState } from "react";
import { EditContext } from "../../entity/contexts";

export default function EditTemplateBody() {
    const { templateRef } = useContext(EditContext)!;

    const [_, setUpdate] = useState<number>(0);

    const handleAddCategory = () => {
        templateRef.current!.categories.push({
            _dependencies: [],
            _isOrdered: false,
            _isSequential: false,
            name: `Category_${templateRef.current!.categories.length}`,
            rows: [],
        });

        setUpdate((prev) => prev + 1);
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
