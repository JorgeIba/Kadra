/** Spanish (Mexico) catalog; its shape is checked against the English contract. */
import type { TranslationCatalog } from "@/app/i18n/catalogs/en-US"

export const esMX = {
  common: {
    actions: {
      appUpdateAvailable: "Actualización disponible",
      back: "Atrás",
      cancel: "Cancelar",
      checkForUpdates: "Buscar actualizaciones",
      clearSearch: "Borrar búsqueda",
      checkingForUpdates: "Buscando actualizaciones",
      clearLocalData: "Borrar datos locales",
      close: "Cerrar",
      exportBackup: "Exportar respaldo",
      goHome: "Ir al inicio",
      hideMoneyAmounts: "Ocultar montos",
      openAppMenu: "Abrir menú de la app",
      reloadApp: "Recargar app",
      restoreBackup: "Restaurar respaldo",
      restorePortfolio: "Restaurar portafolio",
      showMoneyAmounts: "Mostrar montos",
      showAll: "Mostrar todo",
      selectFilter: "Seleccionar filtro",
      selectGrouping: "Seleccionar agrupación",
      selectSort: "Seleccionar orden",
      selectView: "Seleccionar vista",
      tryAgain: "Intentar de nuevo",
      updateNow: "Actualizar ahora",
    },
    accessibility: {
      amountHidden: "Monto oculto",
      assumption: "Supuesto",
      choiceUpdated: "{{label}} actualizado: {{summary}}.",
      choiceUpdating: "{{label}} se está actualizando.",
    },
    counts: {
      active_one: "{{count}} activo",
      active_other: "{{count}} activos",
      day_one: "{{count}} día",
      day_other: "{{count}} días",
      investment_one: "{{count}} inversión",
      investment_other: "{{count}} inversiones",
    },
    currencies: {
      mxn: "MXN",
    },
    grouping: {
      institution: "Institución",
      none: "Ninguno",
      type: "Tipo",
      unknownInstitution: "Institución desconocida",
    },
    earningPace: {
      perDay: "Por día",
      perMonth: "Por mes",
      perYear: "Por año",
    },
    investmentTypes: {
      fixedTerm: "Plazo fijo",
      openEnded: "Abierta",
    },
    paymentFrequencies: {
      atMaturity: "Al vencimiento",
      daily: "Diaria",
      monthly: "Mensual",
      weekly: "Semanal",
    },
    reinvestmentBehaviors: {
      automatic: "Automática",
      toCash: "A efectivo",
    },
    language: {
      label: "Idioma",
      englishUS: "English (United States)",
      spanishMX: "Español (México)",
      system: "Usar el idioma del dispositivo",
    },
    navigation: {
      assets: "Activos",
      dashboard: "Resumen",
      invest: "Invertir",
    },
    search: {
      close: "Cerrar búsqueda",
      noInvestmentsFound: "No se encontraron inversiones.",
      placeholder: "Buscar inversiones",
    },
    report: {
      dashboard: "Reporte del resumen",
    },
    status: {
      active: "Activas",
      finished: "Terminadas",
    },
  },
  appShell: {
    dialogs: {
      clearLocalData: {
        confirm: "Borrar datos locales",
        description:
          "Esto elimina todas las inversiones de tu portafolio local de Kadra.",
        title: "¿Borrar datos locales?",
      },
      restoreError: {
        close: "Cerrar",
        title: "No se pudo restaurar el respaldo",
      },
      restorePortfolio: {
        confirm: "Restaurar portafolio",
        description_one:
          "Esto reemplazará tu portafolio actual con {{count}} inversión de {{fileName}}. Esta acción no se puede deshacer.",
        description_other:
          "Esto reemplazará tu portafolio actual con {{count}} inversiones de {{fileName}}. Esta acción no se puede deshacer.",
        title: "¿Restaurar portafolio?",
      },
      update: {
        description:
          "Hay una nueva versión de Kadra. Actualizar recargará la app para aplicar los últimos cambios.",
        title: "¿Actualizar la app?",
      },
    },
    errorBoundary: {
      details: "Detalles del error",
      description:
        "Tus datos locales guardados deberían seguir disponibles. Puedes intentar renderizar la app de nuevo, recargar la página o revisar la consola del navegador para ver el error técnico.",
      eyebrow: "Kadra encontró un problema inesperado",
      reloadApp: "Recargar app",
      title: "Algo salió mal",
      tryAgain: "Intentar de nuevo",
    },
    restoreErrors: {
      cannotRead:
        "Kadra no pudo leer este archivo. Tus inversiones actuales no cambiaron.",
      cannotSave:
        "Kadra no pudo guardar este respaldo. Tus inversiones actuales no cambiaron.",
      invalid:
        "Este archivo no es un respaldo de portafolio válido de Kadra. Tus inversiones actuales no cambiaron.",
      tooLarge:
        "Este respaldo supera los 5 MB. Elige un respaldo de Kadra más pequeño. Tus inversiones actuales no cambiaron.",
    },
  },
  assets: {
    activeValue: "Valor activo",
    controls: {
      filter: "Filtrar",
      filterAriaLabel: "Filtrar inversiones",
      filterFallback: "Seleccionar filtro",
      groupAriaLabel: "Cambiar vista de activos",
      groupFallback: "Seleccionar vista",
      label: "Vista",
      searchLabel: "Buscar",
      sort: "Ordenar",
      sortAriaLabel: "Ordenar inversiones",
      sortFallback: "Seleccionar orden",
      view: "Vista",
      viewAriaLabel: "Cambiar vista de activos",
    },
    eyebrow: "Activos",
    empty: {
      action: "Agregar inversión",
      description:
        "Crea una inversión para formar tu lista de portafolio local.",
      title: "Tu lista de activos está vacía",
    },
    filterOptions: {
      active: "Activas",
      all: "Todas",
      finished: "Terminadas",
      fixedTerm: "Plazo fijo",
      openEnded: "Abiertas",
    },
    list: {
      count: "{{count}} mostradas",
      emptyFilter: "Ninguna inversión coincide con este filtro.",
      emptySearch: "Ninguna inversión coincide con tu búsqueda.",
      heading: "Lista de inversiones",
      noSearchResultsForFilter:
        "Ningún resultado de búsqueda coincide con este filtro.",
      showAll: "Mostrar todas",
    },
    currentValueAcrossActiveInvestments:
      "Valor actual de las inversiones activas",
    searchPlaceholder: "Nombre, institución o notas",
    title: "Todas las inversiones",
    sortOptions: {
      endDateSoonest: "Fecha final más cercana",
      highestAmount: "Monto más alto",
      highestRate: "Tasa más alta",
      newest: "Más nuevas primero",
    },
    viewOptions: {
      institution: "Agrupar por institución",
      list: "Lista",
    },
  },
  dashboard: {
    activeAssets: {
      activeCount: "{{count}} activas",
      title: "Activos actuales",
    },
    breakdown: {
      activeCapital: "Capital activo",
      description: "Distribución del valor activo por tipo de inversión.",
      empty: "No hay capital activo para distribuir.",
      ofActiveValue: "del valor activo",
    },
    earnings: {
      active: "Activas",
      description:
        "Rendimiento estimado generado hasta hoy, incluyendo inversiones terminadas.",
      earnedReturn: "Rendimiento ganado",
      finished: "Terminadas",
      openReport: "Abrir reporte",
      title: "Rendimientos acumulados",
      trackedInvestments: "Inversiones registradas",
    },
    empty: {
      action: "Agregar inversión",
      description:
        "Agrega tu primera inversión para comenzar a seguir el valor total, los rendimientos estimados y los rendimientos proyectados.",
      title: "Aún no hay inversiones",
    },
    maturities: {
      ends: "Termina",
      inDays: "En {{count}} días",
      title: "Próximos vencimientos",
    },
    projection: {
      description:
        "Basado en las inversiones y tasas actuales, sin aportaciones futuras.",
      earningPaceToday: "Ritmo de rendimiento actual",
      openReport: "Abrir reporte",
      projectedEarnings: "rendimientos proyectados",
      title: "Proyección a 1 año",
    },
    summary: {
      activeInvestments: "Inversiones activas",
      activePortfolioValue: "Valor del portafolio activo",
      earnedSoFar: "Ganado hasta ahora",
    },
  },
  earnings: {
    breakdown: {
      empty: "Agrega inversiones para comenzar a seguir el rendimiento ganado.",
      earned: "Ganado",
      heading: "Desglose por inversión",
    },
    controls: {
      groupAriaLabel: "Agrupar inversiones",
      groupFallback: "Seleccionar agrupación",
      groupLabel: "Agrupar por",
      sortAriaLabel: "Ordenar desglose de rendimiento ganado",
      sortFallback: "Seleccionar orden",
      sortLabel: "Ordenar por",
    },
    notesLabel: "Notas sobre rendimiento ganado",
    reportEyebrow: "Reporte del resumen",
    sortOptions: {
      highestEarned: "Mayor rendimiento ganado",
      lowestEarned: "Menor rendimiento ganado",
      name: "Nombre",
      status: "Estado ({{status}} primero)",
    },
    summary: {
      active: "Activas",
      finished: "Terminadas",
      investments: "Inversiones",
    },
    title: "Rendimiento ganado por el portafolio.",
    totalDescription: "Rendimiento estimado generado hasta hoy.",
    totalEarnedReturn: "Rendimiento total ganado",
    trustNotes: {
      historical:
        "El total histórico incluye inversiones activas y terminadas.",
      estimated:
        "Estimado a partir de las inversiones guardadas en este dispositivo.",
    },
  },
  projection: {
    assumptionsLabel: "Supuestos de la proyección",
    breakdown: {
      addInvestments:
        "Agrega inversiones para comenzar a proyectar rendimientos futuros.",
      heading: "Rendimientos proyectados por inversión",
      projected: "Proyectado",
    },
    controls: {
      groupAriaLabel: "Agrupar inversiones",
      groupFallback: "Seleccionar agrupación",
      groupLabel: "Agrupar por",
    },
    chart: {
      pointLabels: {
        relative: {
          days_one: "{{count}} día",
          days_other: "{{count}} días",
          months_one: "{{count}} mes",
          months_other: "{{count}} meses",
          weeks_one: "{{count}} semana",
          weeks_other: "{{count}} semanas",
          years_one: "{{count}} año",
          years_other: "{{count}} años",
        },
      },
      projectedEarnings: "Rendimientos proyectados",
    },
    date: {
      chooseFuture: "Elige hoy o una fecha futura.",
      label: "Fecha objetivo",
    },
    earningPace: {
      description:
        "Basado en las inversiones que sigan activas en la fecha objetivo.",
      title: "Ritmo en la fecha objetivo",
    },
    maturityScenario: {
      ariaLabel: "Escenario al vencimiento",
      comparison: "Comparado con {{strategy}}",
      descriptions: {
        keepAsCash:
          "El saldo vencido permanece en la proyección como efectivo, pero deja de generar después del vencimiento.",
        reinvest: "El saldo vencido se reinvierte a la tasa actual.",
        strict: "El saldo vencido se excluye de la proyección al vencimiento.",
      },
      legend: "Elige un escenario al vencimiento",
      moreProjectedValueAtTarget: "más valor proyectado en la fecha objetivo",
      lessProjectedValueAtTarget: "menos valor proyectado en la fecha objetivo",
      options: {
        keepAsCash: {
          compactDescription: "Deja de generar",
          description: "Mantén como efectivo el dinero vencido.",
          label: "Efectivo",
          summary: "Mantener como efectivo",
        },
        reinvest: {
          compactDescription: "Sigue generando",
          description: "Reinvierte el dinero vencido.",
          label: "Reinvertir",
          summary: "Reinvertir a la tasa actual",
        },
        strict: {
          compactDescription: "No incluido",
          description: "Excluye el dinero vencido.",
          label: "Excluir",
          summary: "Excluir al vencimiento",
        },
      },
      referenceStrategies: {
        keepAsCash: "mantener como efectivo",
        reinvest: "reinvertir",
        strict: "excluir",
      },
      title: "Escenario al vencimiento",
    },
    reportEyebrow: "Reporte del resumen",
    summary: {
      earnedByTarget: "ganado hasta la fecha objetivo",
      investmentEarning_one: "{{count}} inversión generando rendimiento",
      investmentEarning_other: "{{count}} inversiones generando rendimiento",
      projectedValueOn: "Valor proyectado al {{date}}",
      target: "Objetivo",
      today: "Hoy",
      tomorrow: "Mañana",
    },
    title: "Valor proyectado del portafolio.",
    trustNotes: {
      contributions:
        "Usa las inversiones, aportaciones y tasas guardadas en este dispositivo.",
      maturity:
        "Aplica la estrategia seleccionada cuando vencen las inversiones a plazo fijo.",
      rates: "No modela nuevos depósitos, cambios de tasa ni transferencias.",
    },
    valuePath: {
      description:
        "El valor activo cambia cuando las inversiones a plazo fijo llegan a su vencimiento.",
      title: "Trayectoria del valor",
    },
  },
  investment: {
    cards: {
      annualRate: "Tasa anual",
      liquid: "Líquida",
    },
    detail: {
      actions: {
        delete: "Eliminar inversión",
        recordUpdate: "Registrar cambio",
        updateTerms: "Actualizar términos",
      },
      annualRate: "Tasa anual",
      deleteDescription:
        'Esto elimina "{{name}}" de tu portafolio. Esta acción no se puede deshacer.',
      deleteTitle: "¿Eliminar inversión?",
      details: "Detalles de la inversión",
      earnedSoFar: "Ganado hasta ahora",
      endDate: "Fecha final",
      estimatedValue: "Valor estimado",
      nextDay: "Siguiente día",
      nextWeek: "Siguiente semana",
      nextYear: "Siguiente año",
      originalAmount: "Monto original",
      paymentFrequency: "Frecuencia de pago",
      progress: "Progreso",
      reinvestment: "Reinversión",
      returns: "Rendimientos",
      returnsDescriptionFixedTerm:
        "El estimado comienza hoy y termina al vencimiento.",
      returnsDescriptionOpenEnded:
        "El estimado comienza hoy y continúa mientras la inversión siga activa.",
      startDate: "Fecha inicial",
      startedOn: "Inició el",
      type: "Tipo",
      actionsAriaLabel: "Acciones de la inversión",
    },
    notFound: {
      description:
        "Esta inversión ya no está disponible en tu portafolio local.",
      eyebrow: "Inversión",
      title: "No encontrada",
    },
    preview: {
      atMaturity: "Al vencimiento · {{date}}",
      description:
        "Estimado a partir del monto, la tasa, las fechas y la configuración de rendimientos anterior.",
      estimatedReturn: "rendimiento estimado",
      estimatedValueToday: "Valor estimado hoy",
      initialContribution: "Aportación inicial",
      maturityCountdown: {
        inDays_one: "Vence en {{count}} día",
        inDays_other: "Vence en {{count}} días",
        today: "Vence hoy",
      },
      monthlyReturn: "Rendimiento mensual",
      noInterimPayouts: "Sin pagos intermedios",
      openEnded: "Abierta",
      periodicReturn: "Rendimiento periódico · pagado {{frequency}}",
      projectionPreview: "Vista previa de proyección",
      returnCadence: "Periodicidad del rendimiento",
      returnPaid: "Rendimiento pagado",
      term: "Plazo",
      yearlyReturn: "Rendimiento anual",
    },
  },
  invest: {
    edit: {
      backToDetail: "Volver al detalle",
      changesSaved: "Cambios guardados.",
      description:
        "Actualiza el perfil guardado para que el valor actual, los rendimientos y el seguimiento del vencimiento sigan alineados con los datos más recientes.",
      saveChanges: "Guardar cambios",
    },
    formPreview: {
      description:
        "Agrega los términos requeridos y Kadra estimará el valor, el rendimiento y el progreso al vencimiento antes de guardar.",
    },
    form: {
      actions: {
        saveInvestment: "Guardar inversión",
      },
      discard: {
        confirm: "Descartar cambios",
        description:
          "Tienes cambios sin guardar. Si sales ahora, esos cambios se perderán.",
        title: "¿Descartar cambios?",
      },
      fields: {
        annualRate: "Tasa anual",
        contributionAmount: "Monto de aportación",
        currency: "Moneda",
        endDate: "Fecha final",
        institution: "Institución",
        investmentName: "Nombre de la inversión",
        notes: "Nota privada",
        paymentFrequency: "Frecuencia de pago",
        reinvestment: "Reinversión",
        startDate: "Fecha inicial",
        type: "Tipo",
      },
      errors: {
        annualRateNegative: "La tasa anual no puede ser negativa.",
        atMaturityFixedTermOnly:
          "Al vencimiento sólo está disponible para inversiones a plazo fijo.",
        contributionPositive: "El monto de aportación debe ser mayor que cero.",
        endDateAfterStart:
          "La fecha final debe ser posterior a la fecha inicial.",
        institutionRequired: "La institución es obligatoria.",
        invalidDate: "Usa una fecha válida en formato {{format}}.",
        nameRequired: "El nombre de la inversión es obligatorio.",
        startDateFuture: "La fecha inicial no puede estar en el futuro.",
      },
      guidance: {
        and: "y",
        completeFields: "Completa {{fields}} para guardar esta inversión.",
        reviewFields: "Revisa los campos marcados para guardar esta inversión.",
      },
      optional: "Opcional",
      placeholders: {
        institution: "CETES Directo",
        investmentName: "CETES 6 meses",
        notes: "Ejemplo: se espera renovar la tasa al vencimiento.",
      },
      sections: {
        identity: {
          description: "Nombra la inversión e indica dónde está el dinero.",
          title: "Identidad",
        },
        notes: {
          description: "Contexto opcional para tu yo del futuro.",
          title: "Notas",
        },
        returns: {
          description:
            "Define cada cuánto se pagan los rendimientos y a dónde van.",
          title: "Rendimientos",
        },
        terms: {
          description: "Estos valores determinan la proyección futura.",
          title: "Términos",
        },
      },
      select: {
        currency: "Selecciona la moneda",
        investmentType: "Selecciona el tipo",
        paymentFrequency: "Selecciona la frecuencia de pago",
        reinvestment: "Selecciona la reinversión",
      },
      endDateRequired: "Requerida para inversiones a plazo fijo.",
      savedDraft: "El borrador es válido. Guardarlo es el siguiente paso.",
    },
    screen: {
      description:
        "Captura los términos una vez para que Kadra siga el valor, el ingreso estimado y el avance al vencimiento desde que la guardes.",
      eyebrow: "Invertir",
      title: "Nueva inversión",
    },
  },
  recordChange: {
    errors: {
      addedAmountPositive: "El monto agregado debe ser mayor que cero.",
      amountOnlyWhenMovingMoney:
        "El monto sólo está disponible cuando mueves dinero.",
      annualRateNegative: "La tasa anual no puede ser negativa.",
      atMaturityFixedTermOnly:
        "Al vencimiento sólo está disponible para inversiones a plazo fijo.",
      chooseDateOrLater:
        "Elige {{date}} o una fecha posterior. Por ahora, el cambio sólo puede agregarse al historial existente.",
      effectiveDateFuture: "La fecha efectiva no puede estar en el futuro.",
      invalidDate: "Usa una fecha válida en formato {{format}}.",
      maturityAfterEffectiveDate:
        "La fecha de vencimiento debe ser posterior a la fecha efectiva.",
      withdrawalExceedsBalance:
        "El monto retirado no puede superar el saldo activo de esta fecha.",
      withdrawalBalanceUnavailable:
        "No se puede validar un retiro sin saldo activo para esta fecha.",
      withdrawnAmountPositive: "El monto retirado debe ser mayor que cero.",
    },
    form: {
      actions: {
        backToDetail: "Volver al detalle",
        saveRecord: "Guardar registro",
      },
      discard: {
        confirm: "Descartar registro",
        description:
          "Tienes cambios sin guardar. Si sales ahora, este registro no se guardará.",
        title: "¿Descartar registro?",
      },
      fields: {
        annualRate: "Tasa anual",
        effectiveDate: "Fecha efectiva",
        investmentType: "Tipo",
        maturityDate: "Fecha de vencimiento",
        paymentFrequency: "Frecuencia de pago",
        reinvestment: "Reinversión",
        transactionDateQuestion: "¿Cuándo ocurrió este cambio?",
      },
      guidance: {
        changeSomething:
          "Cambia el dinero, la tasa o los términos para guardar este registro.",
        chooseAppendableDate:
          "Elige una fecha que pueda agregarse al historial existente.",
        chooseEffectiveDate:
          "Elige una fecha efectiva para guardar el registro.",
        enterDepositAmount: "Ingresa el depósito para guardar este registro.",
        enterWithdrawalAmount: "Ingresa el retiro para guardar este registro.",
        ready: "Listo para agregar este registro fechado.",
        reviewFields: "Revisa los campos marcados para guardar este registro.",
      },
      moneyMovement: {
        amount: "Monto",
        ariaLabel: "Movimiento de dinero",
        details: {
          addedAmount: "Monto agregado",
          netCapitalContributed: "Capital neto aportado en esta fecha:",
          availableBalance:
            "Saldo activo disponible para retirar en esta fecha:",
          withdrawnAmount: "Monto retirado",
        },
        legend: "Elige un movimiento de dinero",
        options: {
          contribution: {
            compactDescription: "Agregar capital",
            description: "Agrega capital nuevo a esta inversión.",
            label: "Depósito",
            summary: "Depositar dinero",
          },
          none: {
            compactDescription: "Sin cambio",
            description: "Sólo registra cambios de tasa o de términos.",
            label: "Sin movimiento",
            summary: "Sin movimiento de dinero",
          },
          withdrawal: {
            compactDescription: "Retirar efectivo",
            description: "Retira capital de esta inversión.",
            label: "Retiro",
            summary: "Retirar dinero",
          },
        },
        placeholder: "2500",
      },
      sections: {
        currentTerms: {
          description:
            "Deja los valores sin cambios a menos que hayan cambiado la tasa o los términos actuales.",
          title: "Términos actuales",
        },
        effectiveDate: {
          description:
            "Kadra agregará el historial nuevo a partir de esta fecha.",
          title: "Fecha efectiva",
        },
        moneyMovement: {
          description: "Opcional. Registra un depósito o retiro en esta fecha.",
          title: "Movimiento de dinero",
        },
      },
      select: {
        date: "Selecciona la fecha",
        investmentType: "Selecciona el tipo",
        paymentFrequency: "Selecciona la frecuencia de pago",
        payout: "Selecciona el pago",
        reinvestment: "Selecciona la reinversión",
        type: "Selecciona el tipo",
      },
      summary: {
        annualRate: "Tasa anual",
        description:
          "Revisa lo que agregará este registro fechado antes de guardarlo.",
        effectiveDate: "Fecha efectiva",
        enterRate: "Ingresa la tasa",
        maturity: "Vencimiento",
        movement: "Movimiento",
        noMoneyMovement: "Sin movimiento de dinero",
        pendingDeposit: "Depósito pendiente",
        pendingWithdrawal: "Retiro pendiente",
        payout: "Pago",
        resultingBalance: "Saldo resultante",
        selectDate: "Selecciona la fecha",
        selectMaturityDate: "Selecciona la fecha",
        selectType: "Selecciona el tipo",
        title: "Resumen del registro",
        type: "Tipo",
      },
    },
    screen: {
      description:
        "Agrega historial fechado para esta inversión sin reescribir los registros anteriores.",
    },
  },
} satisfies TranslationCatalog
