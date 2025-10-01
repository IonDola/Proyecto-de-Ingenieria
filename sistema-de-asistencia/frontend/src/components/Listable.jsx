import { useEffect, useState, Children, cloneElement } from "react";
import Tool from "./PageTool";
import "../styles/listable-style.css";

import lettersIcon from "../assets/icons/letters.svg";
import numberIcon from "../assets/icons/numb1.svg";
import advancedIcon from "../assets/icons/filter.svg";
import searchIcon from "../assets/icons/search.svg";

const Listable = ( { columns, children } ) => {
    if (!Array.isArray(columns)) {
        return;
    }

    const columnTemplate = columns.map(col => col.width).join(" ");

    const FilterTools = ( { doAlphabetical, doNumerical, complex } ) => {
        // TODO complex

        return (
            <>
                <div className="search-bar">
                    <img src={searchIcon} alt="Buscar" title="Buscar" className="w-icon"/>
                    <input type="search" />
                </div>
                {doAlphabetical &&
                    <Tool>
                        <img src={lettersIcon} alt="Filtro por nombre" title="Filtro por nombre" className="w-icon"/>
                    </Tool>
                }
                {doNumerical && 
                    <Tool>
                        <img src={numberIcon} alt="Filtro por carnet" title="Filtro por carnet" className="w-icon"/>
                    </Tool>
                }
                <Tool>
                    <img src={advancedIcon} alt="Filtros avanzados" title="Filtros avanzados" className="w-icon"/>
                </Tool>
            </>
        );
    };

    return (
        <div className="listable">
            <div className="filters">
                <FilterTools doAlphabetical={"true"} doNumerical={"true"}/>
            </div>

            <div className="elements-table">
                <div>
                    <div className="elements-title" style={{gridTemplateColumns: columnTemplate}}>
                        {columns.map((col, index) => (
                            <div key={"column" + index}>
                                {col.name}
                            </div>
                        ))}
                    </div>

                    <div className="elements" style={{gridTemplateColumns: columnTemplate}}>
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