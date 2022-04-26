/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
    pgm.dropColumns('clients', {
        project: { type: 'text[][]', notNull: false }
    }),
      pgm.addColumns('clients', {
          project: { type: 'varchar(1000)', notNull: false }
      })
}

exports.down = pgm => {}
