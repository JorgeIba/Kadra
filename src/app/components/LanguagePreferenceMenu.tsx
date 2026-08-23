import { Menu } from "@base-ui/react/menu"
import { Check, ChevronRight, Languages } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  isLocalePreference,
  LOCALE_PREFERENCES,
  useLocale,
  type LocalePreference,
} from "@/app/i18n"

const menuItemClassName =
  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/70 focus:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50"

const optionClassName =
  "relative flex w-full cursor-default items-center gap-3 rounded-md px-3 py-2 pr-9 text-left text-sm text-foreground outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/70 focus:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:font-medium data-checked:text-primary"
const mobileOptionClassName =
  "relative flex min-h-11 w-full cursor-default items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground outline-none transition-colors duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary/70 focus:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:font-medium data-checked:text-primary"

const LANGUAGE_OPTION_VALUES = [
  LOCALE_PREFERENCES.system,
  LOCALE_PREFERENCES.englishUS,
  LOCALE_PREFERENCES.spanishMX,
] as const

interface LanguageSelectionProps {
  languageLabels: Record<LocalePreference, string>
  localePreference: LocalePreference
  onPreferenceChange: (value: unknown) => void
}

interface LanguageMenuContentProps extends LanguageSelectionProps {
  languageLabel: string
}

interface LanguageOptionListProps extends LanguageSelectionProps {
  closeOnClick: boolean
  indicatorPosition: "start" | "end"
  optionClassName: string
}

function LanguageOptionList({
  closeOnClick,
  indicatorPosition,
  languageLabels,
  localePreference,
  onPreferenceChange,
  optionClassName,
}: LanguageOptionListProps): ReactNode {
  return (
    <Menu.RadioGroup
      value={localePreference}
      onValueChange={onPreferenceChange}
    >
      {LANGUAGE_OPTION_VALUES.map((value) => (
        <Menu.RadioItem
          key={value}
          value={value}
          closeOnClick={closeOnClick}
          className={optionClassName}
          label={languageLabels[value]}
        >
          {indicatorPosition === "start" ? (
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center text-primary"
            >
              <Menu.RadioItemIndicator className="flex size-4 items-center justify-center">
                <Check aria-hidden="true" className="size-4" />
              </Menu.RadioItemIndicator>
            </span>
          ) : null}

          <span className="min-w-0">{languageLabels[value]}</span>

          {indicatorPosition === "end" ? (
            <Menu.RadioItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
              <Check aria-hidden="true" className="size-4" />
            </Menu.RadioItemIndicator>
          ) : null}
        </Menu.RadioItem>
      ))}
    </Menu.RadioGroup>
  )
}

function InlineLanguageSection({
  languageLabel,
  languageLabels,
  localePreference,
  onPreferenceChange,
}: LanguageMenuContentProps): ReactNode {
  return (
    <Menu.Group className="md:hidden">
      <Menu.GroupLabel className="flex items-center gap-2 px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">
        <Languages
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        {languageLabel}
      </Menu.GroupLabel>
      <LanguageOptionList
        closeOnClick
        indicatorPosition="start"
        languageLabels={languageLabels}
        localePreference={localePreference}
        onPreferenceChange={onPreferenceChange}
        optionClassName={mobileOptionClassName}
      />
    </Menu.Group>
  )
}

function LanguageSubmenu({
  languageLabel,
  languageLabels,
  localePreference,
  onPreferenceChange,
}: LanguageMenuContentProps): ReactNode {
  return (
    <div className="hidden md:block">
      <Menu.SubmenuRoot>
        <Menu.SubmenuTrigger
          className={menuItemClassName}
          label={languageLabel}
        >
          <Languages
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 flex-1">
            <span className="block">{languageLabel}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {languageLabels[localePreference]}
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </Menu.SubmenuTrigger>

        <Menu.Portal>
          <Menu.Positioner sideOffset={4} className="z-50 outline-none">
            <Menu.Popup className="w-56 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-none outline-none">
              <LanguageOptionList
                closeOnClick
                indicatorPosition="end"
                languageLabels={languageLabels}
                localePreference={localePreference}
                onPreferenceChange={onPreferenceChange}
                optionClassName={optionClassName}
              />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.SubmenuRoot>
    </div>
  )
}

/**
 * Keeps language selection inside the existing overflow menu while exposing
 * the preference, rather than only the currently resolved device language.
 */
export function LanguagePreferenceMenu(): ReactNode {
  const { localePreference, setLocalePreference } = useLocale()
  const { t } = useTranslation()

  const languageLabels: Record<LocalePreference, string> = {
    [LOCALE_PREFERENCES.system]: t("common.language.system"),
    [LOCALE_PREFERENCES.englishUS]: t("common.language.englishUS"),
    [LOCALE_PREFERENCES.spanishMX]: t("common.language.spanishMX"),
  }

  function handlePreferenceChange(value: unknown): void {
    if (typeof value === "string" && isLocalePreference(value)) {
      setLocalePreference(value)
    }
  }

  const languageMenuContentProps: LanguageMenuContentProps = {
    languageLabel: t("common.language.label"),
    languageLabels,
    localePreference,
    onPreferenceChange: handlePreferenceChange,
  }

  return (
    <>
      <InlineLanguageSection {...languageMenuContentProps} />
      <LanguageSubmenu {...languageMenuContentProps} />
    </>
  )
}
