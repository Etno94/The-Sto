/**
 * @type { BusEvents }
 */
export const BUS_EVENTS = {
    generator: {
        build: 'generator: build',
        built: 'generator: built',
        onClick: 'generator: onclick',
        onCD: 'generator: on Cooldown',
        updateCD: 'generator: update Cooldown',
        ready: 'generator: ready to use',
        onUse: 'generator: used',
        elements: {
            onUse: 'generator: element on use',
            statusItems: {
                pointChance: {
                    created: 'generator: point chance created',
                    onUpdate: 'generator: point chance to update',
                    updated: 'generator: point chance updated'
                }
            },
            cdCharges: {
                build: 'generator: cd charge build',
                built: 'generator: cd charge built',
                onCd: 'generator: cd charge built onCd',
                updateCd: 'generator: cd charge built update Cd',
                ready: 'generator: cd charge built ready'
            },
            pulseCells: {
                build: 'generator: pulse cell build',
                built: 'generator: pulse cell built',
                load: 'generator: pulse cell load'
            }
        },
    },
    points: {
        add: 'point: added',
        substract: 'point: substracted',
        substractByType: 'point: substract by type',
        substractedByType: 'point: substracted by type',
        balance: 'point: balanced',
        burnAll: 'point: burn all',
        overcap: 'point: overcap'
    },
    storageUpgrade: {
        unlocked: 'storage upgrade: unlocked',
        onClick: 'storage upgrade: onclick',
        upgrade: 'storage upgrade: upgrade',
        onUpgrade: 'storage upgrade: onupgrade'
    },
    ui: {
        render: 'UI: rendering',
        pointsContainer: {
            hover: 'UI - Points Container: hover'
        }
    }
}