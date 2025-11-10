import { useEffect, useState, Children, cloneElement } from "react";
import Tool from "./PageTool";
import "../styles/listable-style.css";

import lettersIcon from "../assets/icons/letters.svg";
import numberIcon from "../assets/icons/numb1.svg";
import advancedIcon from "../assets/icons/filter.svg";
import searchIcon from "../assets/icons/search.svg";

const Listable = ({ columns, children, searchBox }) => {
    if (!Array.isArray(columns)) {
        return;
    }

    const columnTemplate = columns.map(col => col.width).join(" ");

    const FilterTools = ({ searchBox }) => {
        if (!searchBox) return null;
        // TODO complex

        return (
            <>
                <div className="search-bar">
                    <img src={searchIcon} alt="Buscar" title="Buscar" className="w-icon" />
                    {searchBox}
                </div>
                <Tool>
                    <img src={advancedIcon} alt="Filtros avanzados" title="Filtros avanzados" className="w-icon" />
                </Tool>
            </>
        );
    };

    return (
        <div className="listable">
            {searchBox &&
                <div className="filters">
                    <FilterTools searchBox={searchBox} />
                </div>}

            <div className="elements-table">
                <div>
                    <div className="elements-title" style={{ gridTemplateColumns: columnTemplate }}>
                        {columns.map((col, index) => (
                            <div key={"column" + index}>
                                {col.name}
                            </div>
                        ))}
                    </div>

                    <div className="elements" style={{ gridTemplateColumns: columnTemplate }}>
                        {Children.map(children, child =>
                            cloneElement(child, {
                                style: { display: "grid", gridTemplateColumns: columnTemplate, alignItems: "center" }
                            })
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Listable;