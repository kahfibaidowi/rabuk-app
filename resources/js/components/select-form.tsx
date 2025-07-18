import {default as ReactCreatableSelect} from "react-select/creatable";
import {default as ReactSelect} from "react-select"
import {cn} from "@/lib/utils"

const controlStyles={
    base: "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 w-full items-center justify-between rounded-md border bg-transparent pl-1 pr-2 !text-[14px] shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&>span]:line-clamp-1 !min-h-[36px]",
    focus: "border-ring ring-ring/50"
};
const placeholderStyles="text-muted-foreground pl-1 py-0.5";
const selectInputStyles="pl-1 py-0.5";
const valueContainerStyles="p-1 gap-1";
const singleValueStyles="leading-7 ml-1";
// const multiValueStyles="bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5 bg-slate-300";
// const multiValueLabelStyles="leading-6 py-0.5";
// const multiValueRemoveStyles="border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
const indicatorsContainerStyles="gap-1";
const indicatorSeparatorStyles="hidden";
const dropdownIndicatorStyles="ml-2";
const menuStyles="bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md p-1";
const groupHeadingStyles="ml-3 mt-2 mb-1 text-gray-500 text-sm";
const optionStyles={
    base: "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1 pr-8 pl-2 !text-[14px] outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
    focus: "bg-accent text-accent-foreground"
};
const noOptionsMessageStyles="text-gray-500 p-2 bg-gray-50 rounded-sm";

export const CreatableSelectMulti=(props)=>{
    return (
        <ReactCreatableSelect
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            unstyled
            styles={{
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
                control: (base) => ({
                    ...base,
                    transition: "none",
                }),
            }}
            classNames={{
                control: ({ isFocused }) =>
                    cn(
                        isFocused ? controlStyles.focus : controlStyles.nonFocus,
                        controlStyles.base,
                    ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                    cn(
                        isFocused && optionStyles.focus,
                        isSelected && optionStyles.selected,
                        optionStyles.base,
                    ),
                noOptionsMessage: () => noOptionsMessageStyles,
            }}
            {...props}
        />
    )
}

export const CreatableSelect=(props)=>{
    return (
        <ReactCreatableSelect
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            unstyled
            styles={{
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
                control: (base) => ({
                    ...base,
                    transition: "none",
                }),
            }}
            classNames={{
                control: ({ isFocused }) =>
                    cn(
                        isFocused ? controlStyles.focus : controlStyles.nonFocus,
                        controlStyles.base,
                    ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                    cn(
                    isFocused && optionStyles.focus,
                    isSelected && optionStyles.selected,
                    optionStyles.base,
                    ),
                noOptionsMessage: () => noOptionsMessageStyles,
            }}
            {...props}
        />
    )
}

export const Select=(props)=>{
    return (
        <ReactSelect
            unstyled
            styles={{
                input: (base) => ({
                    ...base,
                    "input:focus": {
                        boxShadow: "none",
                    },
                }),
                multiValueLabel: (base) => ({
                    ...base,
                    whiteSpace: "normal",
                    overflow: "visible",
                }),
                control: (base) => ({
                    ...base,
                    transition: "none",
                }),
            }}
            classNames={{
                control: ({ isFocused }) =>
                    cn(
                        isFocused ? controlStyles.focus : controlStyles.nonFocus,
                        controlStyles.base,
                    ),
                placeholder: () => placeholderStyles,
                input: () => selectInputStyles,
                valueContainer: () => valueContainerStyles,
                singleValue: () => singleValueStyles,
                multiValue: () => multiValueStyles,
                multiValueLabel: () => multiValueLabelStyles,
                multiValueRemove: () => multiValueRemoveStyles,
                indicatorsContainer: () => indicatorsContainerStyles,
                clearIndicator: () => clearIndicatorStyles,
                indicatorSeparator: () => indicatorSeparatorStyles,
                dropdownIndicator: () => dropdownIndicatorStyles,
                menu: () => menuStyles,
                groupHeading: () => groupHeadingStyles,
                option: ({ isFocused, isSelected }) =>
                    cn(
                        isFocused && optionStyles.focus,
                        isSelected && optionStyles.selected,
                        optionStyles.base,
                    ),
                noOptionsMessage: () => noOptionsMessageStyles,
            }}
            {...props}
        />
    )
}