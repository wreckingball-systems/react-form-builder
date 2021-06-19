import React from "react";
import { Form, InputGroup } from "react-bootstrap";
// import Icon from "../elements/Icon";

const Icon = (props) => (<i className={props.icon}></i>);

const InputText = (
    {
        name,
        prepend = null,
        onClear = null,
        label = "",
        type = "text",
        autocomplete = false,
        className = false,
        classNameAppend = "",
        helpText = false,
        errors = {},
        dirty = false,
        canPopulateFromApi = false,
        ...otherProps
    },
    ref
) => {
    const { [name]: { message = false } = {} } = errors;
    const hasError = !!message;

    const getInput = () => {
        const defaultClassName = `form-control${
            onClear ? " border-right-0" : ""
        }`;
        return (
            <input
                id={name}
                type={type}
                name={name}
                autoComplete={autocomplete || name}
                className={
                    className ||
                    `${defaultClassName} ${
                        hasError ? " is-invalid" : ""
                    } ${classNameAppend}`
                }
                ref={ref}
                {...otherProps}
            />
        );
    };

    return (
        <div className="form-group">
            {label && <Form.Label htmlFor={name}>{label}</Form.Label>}
            {prepend ? (
                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text id="basic-addon-pre">
                            <Icon icon={prepend} size="lg" />
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    {getInput()}
                    {!!onClear && (
                        <InputGroup.Append>
                            <InputGroup.Text
                                id="basic-addon-app"
                                className="border-left-0"
                                style={{
                                    backgroundColor: "#ffffff",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    onClear();
                                }}
                            >
                                <Icon icon="times-circle" size="sm" />
                            </InputGroup.Text>
                        </InputGroup.Append>
                    )}
                </InputGroup>
            ) : (
                getInput()
            )}
            {helpText && (
                <Form.Text className="text-muted form-text">
                    {helpText}
                </Form.Text>
            )}
            {hasError && (
                <Form.Text className="invalid-feedback mt-3">
                    {message}
                </Form.Text>
            )}
        </div>
    );
};
InputText.displayName = "InputText";

export default React.forwardRef(InputText);
