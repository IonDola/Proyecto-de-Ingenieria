const PageTool = ({ children, action, type = "button" }) => {
    // TODO
    return (
        <button className="page-tool" onClick={action} type={type}>
            {children}
        </button>
    );
};

export default PageTool;