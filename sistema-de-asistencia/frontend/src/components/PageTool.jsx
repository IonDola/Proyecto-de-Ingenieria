const PageTool = ({ children, action }) => {
    // TODO
    return (
        <button className="page-tool" onClick={action}>
            {children}
        </button>
    );
};

export default PageTool;