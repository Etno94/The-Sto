/**
 * @type { BusEvents }
 */
export const BUS_EVENTS = {
    generator: {
        onClick: 'generator: onclick'
    },
    points: {
        add: 'point: added',
        substract: 'point: substracted',
        balance: 'point: balanced',
        burnAll: 'point: burn all',
        overcap: 'point: overcap'
    },
    ui: {
        render: 'UI: rendering'
    }
}