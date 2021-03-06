// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import ReactSelect, {components, Props as SelectProps, ActionMeta} from 'react-select';
import classNames from 'classnames';

import './multi_input.scss';

// TODO: This component needs work, should not be used outside of InviteMembersStep until this comment is removed.

type ValueType = {
    label: string;
    value: string;
}

type Props<T> = Omit<SelectProps<T>, 'onChange'> & {
    value: T[];
    legend?: string;
    onChange: (value: T[], action: ActionMeta<T[]>) => void;
};

const MultiValueContainer = (props: any) => {
    return (
        <div className={classNames('MultiInput__multiValueContainer', {error: props.data.error})}>
            <components.MultiValueContainer {...props}/>
        </div>
    );
};

const MultiValueRemove = (props: any) => {
    return (
        <div className='MultiInput__multiValueRemove'>
            <components.MultiValueRemove {...props}>
                <i className='icon icon-close-circle'/>
            </components.MultiValueRemove>
        </div>
    );
};

const Placeholder = (props: any) => {
    return (
        <div className='MultiInput__placeholder'>
            <components.Placeholder {...props}/>
        </div>
    );
};

const MultiInput = <T extends ValueType>(props: Props<T>) => {
    const {value, placeholder, className, addon, name, textPrefix, legend, onChange, ...otherProps} = props;

    const [focused, setFocused] = useState(false);

    const onInputFocus = (event: React.FocusEvent<HTMLElement>) => {
        const {onFocus} = props;

        setFocused(true);

        if (onFocus) {
            onFocus(event);
        }
    };

    const onInputBlur = (event: React.FocusEvent<HTMLElement>) => {
        const {onBlur} = props;

        setFocused(false);

        if (onBlur) {
            onBlur(event);
        }
    };

    let inputClass = className ? `Input ${className}` : 'Input';
    let fieldsetClass = className ? `Input_fieldset ${className}` : 'Input_fieldset';
    const showLegend = Boolean(focused || value.length);

    inputClass = showLegend ? inputClass + ' Input___focus' : inputClass;
    fieldsetClass = showLegend ? fieldsetClass + ' Input_fieldset___legend' : fieldsetClass;

    return (
        <div className='MultiInput Input_container'>
            <fieldset className={fieldsetClass}>
                <legend className={showLegend ? 'Input_legend Input_legend___focus' : 'Input_legend'}>{showLegend ? (legend || placeholder) : null}</legend>
                <div
                    className='Input_wrapper'
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                >
                    {textPrefix && <span>{textPrefix}</span>}
                    <ReactSelect
                        id={`MultiInput_${name}`}
                        components={{
                            Menu: () => null,
                            IndicatorsContainer: () => null,
                            MultiValueContainer,
                            MultiValueRemove,
                            Placeholder,
                        }}
                        isMulti={true}
                        isClearable={false}
                        openMenuOnFocus={false}
                        menuIsOpen={false}
                        placeholder={focused ? '' : placeholder}
                        className={inputClass}
                        value={value}
                        onChange={onChange as any} // types are not working correctly for multiselect
                        {...otherProps}
                    />
                </div>
                {addon}
            </fieldset>
        </div>
    );
};

export default MultiInput;
