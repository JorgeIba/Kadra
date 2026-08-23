/**
 * English catalog and shared catalog contract. Every supported locale must
 * expose the same translation-key shape.
 */
export interface TranslationCatalog {
  common: {
    actions: {
      appUpdateAvailable: string
      back: string
      cancel: string
      checkForUpdates: string
      clearSearch: string
      checkingForUpdates: string
      clearLocalData: string
      close: string
      exportBackup: string
      goHome: string
      hideMoneyAmounts: string
      openAppMenu: string
      reloadApp: string
      restoreBackup: string
      restorePortfolio: string
      showMoneyAmounts: string
      showAll: string
      selectFilter: string
      selectGrouping: string
      selectSort: string
      selectView: string
      tryAgain: string
      updateNow: string
    }
    accessibility: {
      amountHidden: string
      assumption: string
      choiceUpdated: string
      choiceUpdating: string
    }
    counts: {
      active_one: string
      active_other: string
      day_one: string
      day_other: string
      investment_one: string
      investment_other: string
    }
    currencies: {
      mxn: string
    }
    grouping: {
      institution: string
      none: string
      type: string
      unknownInstitution: string
    }
    earningPace: {
      perDay: string
      perMonth: string
      perYear: string
    }
    investmentTypes: {
      fixedTerm: string
      openEnded: string
    }
    paymentFrequencies: {
      atMaturity: string
      daily: string
      monthly: string
      weekly: string
    }
    reinvestmentBehaviors: {
      automatic: string
      toCash: string
    }
    language: {
      label: string
      englishUS: string
      spanishMX: string
      system: string
    }
    navigation: {
      assets: string
      dashboard: string
      invest: string
    }
    search: {
      close: string
      noInvestmentsFound: string
      placeholder: string
    }
    report: {
      dashboard: string
    }
    status: {
      active: string
      activePlural: string
      finished: string
      finishedPlural: string
    }
  }
  appShell: {
    dialogs: {
      clearLocalData: {
        confirm: string
        description: string
        title: string
      }
      restoreError: {
        close: string
        title: string
      }
      restorePortfolio: {
        confirm: string
        description_one: string
        description_other: string
        title: string
      }
      update: {
        description: string
        title: string
      }
    }
    errorBoundary: {
      details: string
      description: string
      eyebrow: string
      reloadApp: string
      title: string
      tryAgain: string
    }
    restoreErrors: {
      cannotRead: string
      cannotSave: string
      invalid: string
      tooLarge: string
    }
  }
  assets: {
    activeValue: string
    controls: {
      filter: string
      filterAriaLabel: string
      filterFallback: string
      groupAriaLabel: string
      groupFallback: string
      label: string
      searchLabel: string
      sort: string
      sortAriaLabel: string
      sortFallback: string
      view: string
      viewAriaLabel: string
    }
    eyebrow: string
    empty: {
      action: string
      description: string
      title: string
    }
    filterOptions: {
      active: string
      all: string
      finished: string
      fixedTerm: string
      openEnded: string
    }
    list: {
      count_one: string
      count_other: string
      emptyFilter: string
      emptySearch: string
      heading: string
      noSearchResultsForFilter: string
      showAll: string
    }
    currentValueAcrossActiveInvestments: string
    searchPlaceholder: string
    title: string
    sortOptions: {
      endDateSoonest: string
      highestAmount: string
      highestRate: string
      newest: string
    }
    viewOptions: {
      institution: string
      list: string
    }
  }
  dashboard: {
    activeAssets: {
      activeCount_one: string
      activeCount_other: string
      title: string
    }
    breakdown: {
      activeCapital: string
      description: string
      empty: string
      ofActiveValue: string
    }
    earnings: {
      active: string
      description: string
      earnedReturn: string
      finished: string
      openReport: string
      title: string
      trackedInvestments: string
    }
    empty: {
      action: string
      description: string
      title: string
    }
    maturities: {
      ends: string
      inDays_one: string
      inDays_other: string
      title: string
    }
    projection: {
      description: string
      earningPaceToday: string
      openReport: string
      projectedEarnings: string
      title: string
    }
    summary: {
      activeInvestments: string
      activePortfolioValue: string
      earnedSoFar: string
    }
  }
  earnings: {
    breakdown: {
      empty: string
      earned: string
      heading: string
    }
    controls: {
      groupAriaLabel: string
      groupFallback: string
      groupLabel: string
      sortAriaLabel: string
      sortFallback: string
      sortLabel: string
    }
    notesLabel: string
    reportEyebrow: string
    sortOptions: {
      highestEarned: string
      lowestEarned: string
      name: string
      status: string
    }
    summary: {
      active: string
      finished: string
      investments: string
    }
    title: string
    totalDescription: string
    totalEarnedReturn: string
    trustNotes: {
      historical: string
      estimated: string
    }
  }
  projection: {
    assumptionsLabel: string
    breakdown: {
      addInvestments: string
      heading: string
      projected: string
    }
    controls: {
      groupAriaLabel: string
      groupFallback: string
      groupLabel: string
    }
    chart: {
      pointLabels: {
        relative: {
          days_one: string
          days_other: string
          months_one: string
          months_other: string
          weeks_one: string
          weeks_other: string
          years_one: string
          years_other: string
        }
      }
      projectedEarnings: string
    }
    date: {
      chooseFuture: string
      label: string
    }
    earningPace: {
      description: string
      title: string
    }
    maturityScenario: {
      ariaLabel: string
      comparison: string
      descriptions: {
        keepAsCash: string
        reinvest: string
        strict: string
      }
      legend: string
      moreProjectedValueAtTarget: string
      lessProjectedValueAtTarget: string
      options: {
        keepAsCash: {
          compactDescription: string
          description: string
          label: string
          summary: string
        }
        reinvest: {
          compactDescription: string
          description: string
          label: string
          summary: string
        }
        strict: {
          compactDescription: string
          description: string
          label: string
          summary: string
        }
      }
      referenceStrategies: {
        keepAsCash: string
        reinvest: string
        strict: string
      }
      title: string
    }
    reportEyebrow: string
    summary: {
      earnedByTarget: string
      investmentEarning_one: string
      investmentEarning_other: string
      projectedValueOn: string
      target: string
      today: string
      tomorrow: string
    }
    title: string
    trustNotes: {
      contributions: string
      maturity: string
      rates: string
    }
    valuePath: {
      description: string
      title: string
    }
  }
  investment: {
    cards: {
      annualRate: string
      liquid: string
    }
    detail: {
      actions: {
        delete: string
        recordUpdate: string
        updateTerms: string
      }
      annualRate: string
      deleteDescription: string
      deleteTitle: string
      details: string
      earnedSoFar: string
      endDate: string
      estimatedValue: string
      nextDay: string
      nextWeek: string
      nextYear: string
      notes: string
      originalAmount: string
      paymentFrequency: string
      progress: string
      reinvestment: string
      returns: string
      returnsDescriptionFixedTerm: string
      returnsDescriptionOpenEnded: string
      startDate: string
      startedOn: string
      type: string
      actionsAriaLabel: string
    }
    notFound: {
      description: string
      eyebrow: string
      title: string
    }
    preview: {
      atMaturity: string
      description: string
      estimatedReturn: string
      estimatedValueToday: string
      initialContribution: string
      maturityCountdown: {
        inDays_one: string
        inDays_other: string
        today: string
      }
      monthlyReturn: string
      noInterimPayouts: string
      openEnded: string
      periodicReturn: string
      projectionPreview: string
      returnCadence: string
      returnPaid: string
      term: string
      yearlyReturn: string
    }
  }
  invest: {
    edit: {
      backToDetail: string
      changesSaved: string
      description: string
      saveChanges: string
    }
    formPreview: {
      description: string
    }
    form: {
      actions: {
        saveInvestment: string
      }
      discard: {
        confirm: string
        description: string
        title: string
      }
      fields: {
        annualRate: string
        contributionAmount: string
        currency: string
        endDate: string
        institution: string
        investmentName: string
        notes: string
        paymentFrequency: string
        reinvestment: string
        startDate: string
        type: string
      }
      errors: {
        annualRateNegative: string
        atMaturityFixedTermOnly: string
        contributionPositive: string
        endDateAfterStart: string
        institutionRequired: string
        invalidDate: string
        nameRequired: string
        startDateFuture: string
      }
      guidance: {
        and: string
        completeFields: string
        reviewFields: string
      }
      optional: string
      placeholders: {
        institution: string
        investmentName: string
        notes: string
      }
      sections: {
        identity: {
          description: string
          title: string
        }
        notes: {
          description: string
          title: string
        }
        returns: {
          description: string
          title: string
        }
        terms: {
          description: string
          title: string
        }
      }
      select: {
        currency: string
        investmentType: string
        paymentFrequency: string
        reinvestment: string
      }
      endDateRequired: string
      savedDraft: string
    }
    screen: {
      description: string
      eyebrow: string
      title: string
    }
  }
  recordChange: {
    errors: {
      addedAmountPositive: string
      amountOnlyWhenMovingMoney: string
      annualRateNegative: string
      atMaturityFixedTermOnly: string
      chooseDateOrLater: string
      effectiveDateFuture: string
      invalidDate: string
      maturityAfterEffectiveDate: string
      withdrawalExceedsBalance: string
      withdrawalBalanceUnavailable: string
      withdrawnAmountPositive: string
    }
    form: {
      actions: {
        backToDetail: string
        saveRecord: string
      }
      discard: {
        confirm: string
        description: string
        title: string
      }
      fields: {
        annualRate: string
        effectiveDate: string
        investmentType: string
        maturityDate: string
        paymentFrequency: string
        reinvestment: string
        transactionDateQuestion: string
      }
      guidance: {
        changeSomething: string
        chooseAppendableDate: string
        chooseEffectiveDate: string
        enterDepositAmount: string
        enterWithdrawalAmount: string
        ready: string
        reviewFields: string
      }
      moneyMovement: {
        amount: string
        ariaLabel: string
        details: {
          addedAmount: string
          netCapitalContributed: string
          availableBalance: string
          withdrawnAmount: string
        }
        legend: string
        options: {
          contribution: {
            compactDescription: string
            description: string
            label: string
            summary: string
          }
          none: {
            compactDescription: string
            description: string
            label: string
            summary: string
          }
          withdrawal: {
            compactDescription: string
            description: string
            label: string
            summary: string
          }
        }
        placeholder: string
      }
      sections: {
        currentTerms: {
          description: string
          title: string
        }
        effectiveDate: {
          description: string
          title: string
        }
        moneyMovement: {
          description: string
          title: string
        }
      }
      select: {
        date: string
        investmentType: string
        paymentFrequency: string
        payout: string
        reinvestment: string
        type: string
      }
      summary: {
        annualRate: string
        description: string
        effectiveDate: string
        enterRate: string
        maturity: string
        movement: string
        noMoneyMovement: string
        pendingDeposit: string
        pendingWithdrawal: string
        payout: string
        resultingBalance: string
        selectDate: string
        selectMaturityDate: string
        selectType: string
        title: string
        type: string
      }
    }
    screen: {
      description: string
    }
  }
}

export const enUS = {
  common: {
    actions: {
      appUpdateAvailable: "App update available",
      back: "Back",
      cancel: "Cancel",
      checkForUpdates: "Check for updates",
      clearSearch: "Clear search",
      checkingForUpdates: "Checking for updates",
      clearLocalData: "Clear local data",
      close: "Close",
      exportBackup: "Export backup",
      goHome: "Go home",
      hideMoneyAmounts: "Hide money amounts",
      openAppMenu: "Open app menu",
      reloadApp: "Reload app",
      restoreBackup: "Restore backup",
      restorePortfolio: "Restore portfolio",
      showMoneyAmounts: "Show money amounts",
      showAll: "Show all",
      selectFilter: "Select filter",
      selectGrouping: "Select grouping",
      selectSort: "Select sort",
      selectView: "Select view",
      tryAgain: "Try again",
      updateNow: "Update now",
    },
    accessibility: {
      amountHidden: "Amount hidden",
      assumption: "Assumption",
      choiceUpdated: "{{label}} updated: {{summary}}.",
      choiceUpdating: "{{label}} is updating.",
    },
    counts: {
      active_one: "{{count}} active",
      active_other: "{{count}} active",
      day_one: "{{count}} day",
      day_other: "{{count}} days",
      investment_one: "{{count}} investment",
      investment_other: "{{count}} investments",
    },
    currencies: {
      mxn: "MXN",
    },
    grouping: {
      institution: "Institution",
      none: "None",
      type: "Type",
      unknownInstitution: "Unknown institution",
    },
    earningPace: {
      perDay: "Per day",
      perMonth: "Per month",
      perYear: "Per year",
    },
    investmentTypes: {
      fixedTerm: "Fixed term",
      openEnded: "Open ended",
    },
    paymentFrequencies: {
      atMaturity: "At maturity",
      daily: "Daily",
      monthly: "Monthly",
      weekly: "Weekly",
    },
    reinvestmentBehaviors: {
      automatic: "Automatic",
      toCash: "To cash",
    },
    language: {
      label: "Language",
      englishUS: "English (United States)",
      spanishMX: "Español (México)",
      system: "Use device language",
    },
    navigation: {
      assets: "Assets",
      dashboard: "Dashboard",
      invest: "Invest",
    },
    search: {
      close: "Close search",
      noInvestmentsFound: "No investments found.",
      placeholder: "Search investments",
    },
    report: {
      dashboard: "Dashboard report",
    },
    status: {
      active: "Active",
      activePlural: "Active",
      finished: "Finished",
      finishedPlural: "Finished",
    },
  },
  appShell: {
    dialogs: {
      clearLocalData: {
        confirm: "Clear local data",
        description:
          "This removes every investment from your local Kadra portfolio.",
        title: "Clear local data?",
      },
      restoreError: {
        close: "Close",
        title: "Unable to restore backup",
      },
      restorePortfolio: {
        confirm: "Restore portfolio",
        description_one:
          "This will replace your current portfolio with {{count}} investment from {{fileName}}. This cannot be undone.",
        description_other:
          "This will replace your current portfolio with {{count}} investments from {{fileName}}. This cannot be undone.",
        title: "Restore portfolio?",
      },
      update: {
        description:
          "A new version of Kadra is ready. Updating will reload the app so the latest changes can take over.",
        title: "Update app?",
      },
    },
    errorBoundary: {
      details: "Error details",
      description:
        "Your saved local data should still be available. You can try rendering the app again, reload the page, or check the browser console for the technical error.",
      eyebrow: "Kadra hit an unexpected problem",
      reloadApp: "Reload app",
      title: "Something went wrong",
      tryAgain: "Try again",
    },
    restoreErrors: {
      cannotRead:
        "Kadra could not read this file. Your current investments were not changed.",
      cannotSave:
        "Kadra could not save this backup. Your current investments were not changed.",
      invalid:
        "This file is not a valid Kadra portfolio backup. Your current investments were not changed.",
      tooLarge:
        "This backup is larger than 5 MB. Choose a smaller Kadra backup file. Your current investments were not changed.",
    },
  },
  assets: {
    activeValue: "Active value",
    controls: {
      filter: "Filter",
      filterAriaLabel: "Filter investments",
      filterFallback: "Select filter",
      groupAriaLabel: "Change asset list view",
      groupFallback: "Select view",
      label: "View",
      searchLabel: "Search",
      sort: "Sort",
      sortAriaLabel: "Sort investments",
      sortFallback: "Select sort",
      view: "View",
      viewAriaLabel: "Change asset list view",
    },
    eyebrow: "Assets",
    empty: {
      action: "Add investment",
      description: "Create an investment to build your local portfolio list.",
      title: "Your asset list is empty",
    },
    filterOptions: {
      active: "Active",
      all: "All",
      finished: "Finished",
      fixedTerm: "Fixed term",
      openEnded: "Open ended",
    },
    list: {
      count_one: "{{count}} shown",
      count_other: "{{count}} shown",
      emptyFilter: "No investments match this filter.",
      emptySearch: "No investments match your search.",
      heading: "Investment list",
      noSearchResultsForFilter: "No search results match this filter.",
      showAll: "Show all",
    },
    currentValueAcrossActiveInvestments:
      "Current value across active investments",
    searchPlaceholder: "Name, institution, or notes",
    title: "All investments",
    sortOptions: {
      endDateSoonest: "End date soonest",
      highestAmount: "Highest amount",
      highestRate: "Highest rate",
      newest: "Newest first",
    },
    viewOptions: {
      institution: "Institution groups",
      list: "List",
    },
  },
  dashboard: {
    activeAssets: {
      activeCount_one: "{{count}} active",
      activeCount_other: "{{count}} active",
      title: "Active assets",
    },
    breakdown: {
      activeCapital: "Active capital",
      description: "Share of active value by investment type.",
      empty: "No active capital to distribute.",
      ofActiveValue: "of active value",
    },
    earnings: {
      active: "Active",
      description:
        "Estimated return produced through today, including finished investments.",
      earnedReturn: "Earned return",
      finished: "Finished",
      openReport: "Open report",
      title: "Accrued earnings",
      trackedInvestments: "Tracked investments",
    },
    empty: {
      action: "Add investment",
      description:
        "Add your first investment to start tracking total value, estimated earnings, and projected returns.",
      title: "No investments yet",
    },
    maturities: {
      ends: "Ends",
      inDays_one: "In {{count}} day",
      inDays_other: "In {{count}} days",
      title: "Upcoming maturities",
    },
    projection: {
      description:
        "Based on current investments and rates, with no future contributions.",
      earningPaceToday: "Earning pace today",
      openReport: "Open report",
      projectedEarnings: "projected earnings",
      title: "1-year projection",
    },
    summary: {
      activeInvestments: "Active investments",
      activePortfolioValue: "Active portfolio value",
      earnedSoFar: "Earned so far",
    },
  },
  earnings: {
    breakdown: {
      empty: "Add investments to start tracking earned return.",
      earned: "Earned",
      heading: "Breakdown by investment",
    },
    controls: {
      groupAriaLabel: "Group investments",
      groupFallback: "Select grouping",
      groupLabel: "Group by",
      sortAriaLabel: "Sort earned return breakdown",
      sortFallback: "Select sort",
      sortLabel: "Sort by",
    },
    notesLabel: "Earned return notes",
    reportEyebrow: "Dashboard report",
    sortOptions: {
      highestEarned: "Highest earned",
      lowestEarned: "Lowest earned",
      name: "Name",
      status: "Status ({{status}} first)",
    },
    summary: {
      active: "Active",
      finished: "Finished",
      investments: "Investments",
    },
    title: "Return earned by the portfolio.",
    totalDescription: "Estimated return produced through today.",
    totalEarnedReturn: "Total earned return",
    trustNotes: {
      historical: "Historical total includes active and finished investments.",
      estimated: "Estimated from the investments saved on this device.",
    },
  },
  projection: {
    assumptionsLabel: "Projection assumptions",
    breakdown: {
      addInvestments: "Add investments to start projecting future earnings.",
      heading: "Projected earnings by investment",
      projected: "Projected",
    },
    controls: {
      groupAriaLabel: "Group investments",
      groupFallback: "Select grouping",
      groupLabel: "Group by",
    },
    chart: {
      pointLabels: {
        relative: {
          days_one: "{{count}} day",
          days_other: "{{count}} days",
          months_one: "{{count}} month",
          months_other: "{{count}} months",
          weeks_one: "{{count}} week",
          weeks_other: "{{count}} weeks",
          years_one: "{{count}} year",
          years_other: "{{count}} years",
        },
      },
      projectedEarnings: "Projected earnings",
    },
    date: {
      chooseFuture: "Choose today or a future date.",
      label: "Target date",
    },
    earningPace: {
      description: "Based on investments still active on the target date.",
      title: "Pace on target date",
    },
    maturityScenario: {
      ariaLabel: "Maturity scenario",
      comparison: "Compared with {{strategy}}",
      descriptions: {
        keepAsCash:
          "The matured balance stays in the projection as cash, but stops earning after maturity.",
        reinvest: "The matured balance is reinvested at the current rate.",
        strict:
          "The matured balance is excluded from the projection at maturity.",
      },
      legend: "Choose a maturity scenario",
      moreProjectedValueAtTarget: "more projected value at target",
      lessProjectedValueAtTarget: "less projected value at target",
      options: {
        keepAsCash: {
          compactDescription: "Stops earning",
          description: "Hold matured money as cash.",
          label: "Cash",
          summary: "Hold as cash",
        },
        reinvest: {
          compactDescription: "Keeps earning",
          description: "Reinvest matured money.",
          label: "Reinvest",
          summary: "Reinvest at current rate",
        },
        strict: {
          compactDescription: "Not included",
          description: "Exclude matured money.",
          label: "Exclude",
          summary: "Exclude at maturity",
        },
      },
      referenceStrategies: {
        keepAsCash: "holding as cash",
        reinvest: "reinvesting",
        strict: "excluding",
      },
      title: "Maturity scenario",
    },
    reportEyebrow: "Dashboard report",
    summary: {
      earnedByTarget: "earned by target",
      investmentEarning_one: "{{count}} investment earning",
      investmentEarning_other: "{{count}} investments earning",
      projectedValueOn: "Projected value on {{date}}",
      target: "Target",
      today: "Today",
      tomorrow: "Tomorrow",
    },
    title: "Projected portfolio value.",
    trustNotes: {
      contributions:
        "Uses the investments, contributions, and rates saved on this device.",
      maturity:
        "Applies the selected strategy when fixed-term investments mature.",
      rates: "Does not model new deposits, rate changes, or transfers.",
    },
    valuePath: {
      description:
        "Active value changes as fixed-term investments reach maturity.",
      title: "Value path",
    },
  },
  investment: {
    cards: {
      annualRate: "Annual rate",
      liquid: "Liquid",
    },
    detail: {
      actions: {
        delete: "Delete investment",
        recordUpdate: "Record update",
        updateTerms: "Update terms",
      },
      annualRate: "Annual rate",
      deleteDescription:
        'This removes "{{name}}" from your portfolio. This action cannot be undone.',
      deleteTitle: "Delete investment?",
      details: "Investment details",
      earnedSoFar: "Earned so far",
      endDate: "End date",
      estimatedValue: "Estimated value",
      nextDay: "Next day",
      nextWeek: "Next week",
      nextYear: "Next year",
      notes: "Notes",
      originalAmount: "Original amount",
      paymentFrequency: "Payment frequency",
      progress: "Progress",
      reinvestment: "Reinvestment",
      returns: "Returns",
      returnsDescriptionFixedTerm:
        "Estimates start today and stop at maturity.",
      returnsDescriptionOpenEnded:
        "Estimates start today and continue while the investment stays active.",
      startDate: "Start date",
      startedOn: "Started on",
      type: "Type",
      actionsAriaLabel: "Investment actions",
    },
    notFound: {
      description:
        "This investment is no longer available in your local portfolio.",
      eyebrow: "Investment",
      title: "Not found",
    },
    preview: {
      atMaturity: "At maturity · {{date}}",
      description:
        "Estimated from the amount, rate, dates, and return settings above.",
      estimatedReturn: "estimated return",
      estimatedValueToday: "Estimated value today",
      initialContribution: "Initial contribution",
      maturityCountdown: {
        inDays_one: "Matures in {{count}} day",
        inDays_other: "Matures in {{count}} days",
        today: "Matures today",
      },
      monthlyReturn: "Monthly return",
      noInterimPayouts: "No interim payouts",
      openEnded: "Open ended",
      periodicReturn: "Periodic return · paid {{frequency}}",
      projectionPreview: "Projection preview",
      returnCadence: "Return cadence",
      returnPaid: "Return paid",
      term: "Term",
      yearlyReturn: "Yearly return",
    },
  },
  invest: {
    edit: {
      backToDetail: "Back to detail",
      changesSaved: "Changes saved.",
      description:
        "Update the stored profile so current value, income, and maturity tracking stay aligned with the latest details.",
      saveChanges: "Save changes",
    },
    formPreview: {
      description:
        "Add the required terms and Kadra will estimate value, return, and maturity progress before you save.",
    },
    form: {
      actions: {
        saveInvestment: "Save investment",
      },
      discard: {
        confirm: "Discard changes",
        description:
          "You have unsaved changes. If you leave now, those changes will be lost.",
        title: "Discard changes?",
      },
      fields: {
        annualRate: "Annual rate",
        contributionAmount: "Contribution amount",
        currency: "Currency",
        endDate: "End date",
        institution: "Institution",
        investmentName: "Investment name",
        notes: "Private note",
        paymentFrequency: "Payment frequency",
        reinvestment: "Reinvestment",
        startDate: "Start date",
        type: "Type",
      },
      errors: {
        annualRateNegative: "Annual rate cannot be negative.",
        atMaturityFixedTermOnly:
          "At maturity is only available for fixed-term investments.",
        contributionPositive: "Contribution amount must be greater than zero.",
        endDateAfterStart: "End date must be after the start date.",
        institutionRequired: "Institution is required.",
        invalidDate: "Use a valid date in {{format}} format.",
        nameRequired: "Investment name is required.",
        startDateFuture: "Start date cannot be in the future.",
      },
      guidance: {
        and: "and",
        completeFields: "Complete {{fields}} to save this investment.",
        reviewFields: "Review the highlighted fields to save this investment.",
      },
      optional: "Optional",
      placeholders: {
        institution: "CETES Directo",
        investmentName: "CETES 6 months",
        notes: "Example: rate renewal expected after maturity.",
      },
      sections: {
        identity: {
          description: "Name the investment and where the money lives.",
          title: "Identity",
        },
        notes: {
          description: "Optional context for future you.",
          title: "Notes",
        },
        returns: {
          description: "Define how often returns are paid and where they go.",
          title: "Returns",
        },
        terms: {
          description: "These values drive the future projection.",
          title: "Terms",
        },
      },
      select: {
        currency: "Select currency",
        investmentType: "Select type",
        paymentFrequency: "Select payment frequency",
        reinvestment: "Select reinvestment",
      },
      endDateRequired: "Required for fixed-term investments.",
      savedDraft: "Draft is valid. Saving comes next.",
    },
    screen: {
      description:
        "Capture the terms once so Kadra can track value, estimated income, and maturity progress from the moment you save it.",
      eyebrow: "Invest",
      title: "New investment",
    },
  },
  recordChange: {
    errors: {
      addedAmountPositive: "Added amount must be greater than zero.",
      amountOnlyWhenMovingMoney: "Amount is only available when moving money.",
      annualRateNegative: "Annual rate cannot be negative.",
      atMaturityFixedTermOnly:
        "At maturity is only available for fixed-term investments.",
      chooseDateOrLater:
        "Choose {{date}} or later. Record change can only append to existing history for now.",
      effectiveDateFuture: "Effective date cannot be in the future.",
      invalidDate: "Use a valid date in {{format}} format.",
      maturityAfterEffectiveDate:
        "Maturity date must be after the effective date.",
      withdrawalExceedsBalance:
        "Withdrawn amount cannot exceed the active balance on this date.",
      withdrawalBalanceUnavailable:
        "Cannot validate a withdrawal without an active balance for this date.",
      withdrawnAmountPositive: "Withdrawn amount must be greater than zero.",
    },
    form: {
      actions: {
        backToDetail: "Back to detail",
        saveRecord: "Save record",
      },
      discard: {
        confirm: "Discard record",
        description:
          "You have unsaved changes. If you leave now, this record will not be saved.",
        title: "Discard record?",
      },
      fields: {
        annualRate: "Annual rate",
        effectiveDate: "Effective date",
        investmentType: "Type",
        maturityDate: "Maturity date",
        paymentFrequency: "Payment frequency",
        reinvestment: "Reinvestment",
        transactionDateQuestion: "When did this change happen?",
      },
      guidance: {
        changeSomething: "Change money, rate, or terms to save this record.",
        chooseAppendableDate:
          "Choose a date that can append to the existing history.",
        chooseEffectiveDate: "Choose an effective date to save this record.",
        enterDepositAmount: "Enter the deposit amount to save this record.",
        enterWithdrawalAmount:
          "Enter the withdrawal amount to save this record.",
        ready: "Ready to append this dated record.",
        reviewFields: "Review the highlighted fields to save this record.",
      },
      moneyMovement: {
        amount: "Amount",
        ariaLabel: "Money movement",
        details: {
          addedAmount: "Added amount",
          netCapitalContributed: "Net capital contributed on this date:",
          availableBalance:
            "Available active balance to withdraw on this date:",
          withdrawnAmount: "Withdrawn amount",
        },
        legend: "Choose a money movement",
        options: {
          contribution: {
            compactDescription: "Add capital",
            description: "Add new capital to this investment.",
            label: "Deposit",
            summary: "Deposit money",
          },
          none: {
            compactDescription: "No change",
            description: "Only record rate or term changes.",
            label: "No movement",
            summary: "No money movement",
          },
          withdrawal: {
            compactDescription: "Cash out",
            description: "Take capital out of this investment.",
            label: "Withdrawal",
            summary: "Withdraw money",
          },
        },
        placeholder: "2500",
      },
      sections: {
        currentTerms: {
          description:
            "Leave values unchanged unless the current rate or terms changed.",
          title: "Current terms",
        },
        effectiveDate: {
          description: "Kadra will append new history from this date onward.",
          title: "Effective date",
        },
        moneyMovement: {
          description: "Optional. Record a deposit or withdrawal on this date.",
          title: "Money movement",
        },
      },
      select: {
        date: "Select date",
        investmentType: "Select type",
        paymentFrequency: "Select payment frequency",
        payout: "Select payout",
        reinvestment: "Select reinvestment",
        type: "Select type",
      },
      summary: {
        annualRate: "Annual rate",
        description: "Review what this dated record will append before saving.",
        effectiveDate: "Effective date",
        enterRate: "Enter rate",
        maturity: "Maturity",
        movement: "Movement",
        noMoneyMovement: "No money movement",
        pendingDeposit: "Deposit amount pending",
        pendingWithdrawal: "Withdrawal amount pending",
        payout: "Payout",
        resultingBalance: "Resulting balance",
        selectDate: "Select date",
        selectMaturityDate: "Select date",
        selectType: "Select type",
        title: "Record summary",
        type: "Type",
      },
    },
    screen: {
      description:
        "Append dated history for this investment without rewriting earlier records.",
    },
  },
} satisfies TranslationCatalog
