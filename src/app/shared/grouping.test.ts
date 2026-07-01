import { describe, expect, it } from "vitest"
import { createGroups } from "@/app/shared/grouping"

describe("createGroups", () => {
  it("creates grouped breakdowns with a total metric and item contribution metrics", () => {
    const items = [
      { groupKey: "Klar", groupLabel: "Klar", earned: 10 },
      { groupKey: "CETES", groupLabel: "CETES", earned: 30 },
      { groupKey: "Klar", groupLabel: "Klar", earned: 15 },
    ]

    expect(
      createGroups(items, {
        getGroup: (item) => ({ key: item.groupKey, label: item.groupLabel }),
        metric: {
          key: "earned",
          label: "Earned",
          getValue: (item) => item.earned,
        },
      }),
    ).toEqual([
      {
        key: "Klar",
        label: "Klar",
        totalMetric: {
          key: "earned",
          label: "Earned",
          value: 25,
          shareOfTotal: undefined,
        },
        items: [
          {
            source: items[0],
            contributionMetric: {
              key: "earned",
              label: "Earned",
              value: 10,
              shareOfGroup: 40,
            },
          },
          {
            source: items[2],
            contributionMetric: {
              key: "earned",
              label: "Earned",
              value: 15,
              shareOfGroup: 60,
            },
          },
        ],
      },
      {
        key: "CETES",
        label: "CETES",
        totalMetric: {
          key: "earned",
          label: "Earned",
          value: 30,
          shareOfTotal: undefined,
        },
        items: [
          {
            source: items[1],
            contributionMetric: {
              key: "earned",
              label: "Earned",
              value: 30,
              shareOfGroup: 100,
            },
          },
        ],
      },
    ])
  })

  it("adds share of total when the metric declares a total value", () => {
    const groups = createGroups([{ groupKey: "Klar", earned: 25 }], {
      getGroup: (item) => ({ key: item.groupKey, label: item.groupKey }),
      metric: {
        key: "earned",
        label: "Earned",
        getValue: (item) => item.earned,
        totalValue: 100,
      },
    })

    expect(groups[0]?.totalMetric.shareOfTotal).toBe(25)
  })

  it("uses zero share of total when total value is zero", () => {
    const groups = createGroups([{ groupKey: "Klar", earned: 25 }], {
      getGroup: (item) => ({ key: item.groupKey, label: item.groupKey }),
      metric: {
        key: "earned",
        label: "Earned",
        getValue: (item) => item.earned,
        totalValue: 0,
      },
    })

    expect(groups[0]?.totalMetric.shareOfTotal).toBe(0)
  })

  it("uses zero share of group when the group metric value is zero", () => {
    const groups = createGroups([{ groupKey: "Klar", earned: 0 }], {
      getGroup: (item) => ({ key: item.groupKey, label: item.groupKey }),
      metric: {
        key: "earned",
        label: "Earned",
        getValue: (item) => item.earned,
      },
    })

    expect(groups[0]?.items[0]?.contributionMetric.shareOfGroup).toBe(0)
  })

  it("treats different keys as different groups even when labels are similar", () => {
    const groups = createGroups(
      [
        { groupKey: "Nu", groupLabel: "Nu", earned: 10 },
        { groupKey: "nu", groupLabel: "nu", earned: 20 },
      ],
      {
        getGroup: (item) => ({ key: item.groupKey, label: item.groupLabel }),
        metric: {
          key: "earned",
          label: "Earned",
          getValue: (item) => item.earned,
        },
      },
    )

    expect(groups.map((group) => group.key)).toEqual(["Nu", "nu"])
  })

  it("keeps the first label when several items share a key", () => {
    const groups = createGroups(
      [
        { groupKey: "klar", groupLabel: "Klar", earned: 10 },
        { groupKey: "klar", groupLabel: "KLAR", earned: 20 },
      ],
      {
        getGroup: (item) => ({ key: item.groupKey, label: item.groupLabel }),
        metric: {
          key: "earned",
          label: "Earned",
          getValue: (item) => item.earned,
        },
      },
    )

    expect(groups[0]?.label).toBe("Klar")
  })

  it("keeps row order inside each group", () => {
    const items = [
      { groupKey: "Klar", earned: 10 },
      { groupKey: "Klar", earned: 15 },
      { groupKey: "Klar", earned: 20 },
    ]

    expect(
      createGroups(items, {
        getGroup: (item) => ({ key: item.groupKey, label: item.groupKey }),
        metric: {
          key: "earned",
          label: "Earned",
          getValue: (item) => item.earned,
        },
      })[0]?.items.map((item) => item.source),
    ).toEqual(items)
  })

  it("keeps group order based on the first item that created each group", () => {
    const groups = createGroups(
      [
        { groupKey: "Klar", earned: 10 },
        { groupKey: "CETES", earned: 50 },
        { groupKey: "Klar", earned: 100 },
      ],
      {
        getGroup: (item) => ({ key: item.groupKey, label: item.groupKey }),
        metric: {
          key: "earned",
          label: "Earned",
          getValue: (item) => item.earned,
        },
      },
    )

    expect(groups.map((group) => group.key)).toEqual(["Klar", "CETES"])
  })
})
