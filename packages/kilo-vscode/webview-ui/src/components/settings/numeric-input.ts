import { createSignal, createEffect, on } from "solid-js"

/**
 * Hook for numeric input fields that allows typing intermediate states
 * like "0." without immediately parsing and overwriting the value.
 * 
 * @param value - The numeric value from config (number | undefined)
 * @param onChange - Callback when a valid number is committed (on blur)
 * @returns Object with inputValue, onInputChange, and onBlur handlers
 */
export function useNumericInput(
  value: () => number | undefined,
  onChange: (val: number | undefined) => void,
  parser: (val: string) => number = parseFloat
) {
  // Local "raw" string value during editing
  const [inputValue, setInputValue] = createSignal<string>("")
  // Track if we're actively editing (to avoid overwriting user input)
  const [isEditing, setIsEditing] = createSignal(false)

  // Sync from external value when not editing
  createEffect(
    on(value, (val) => {
      if (!isEditing()) {
        setInputValue(val?.toString() ?? "")
      }
    })
  )

  const onInputChange = (val: string) => {
    setIsEditing(true)
    setInputValue(val)
  }

  const onBlur = () => {
    setIsEditing(false)
    const val = inputValue().trim()
    if (val === "") {
      onChange(undefined)
      return
    }
    const parsed = parser(val)
    if (isNaN(parsed)) {
      // Reset to last valid value on invalid input
      setInputValue(value()?.toString() ?? "")
      return
    }
    onChange(parsed)
    // Normalize display (e.g., "0.30" -> "0.3")
    setInputValue(parsed.toString())
  }

  return {
    inputValue,
    onInputChange,
    onBlur,
  }
}
