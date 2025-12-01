exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'VARCHAR(100)', notNull: true },
    email: { type: 'VARCHAR(150)', notNull: true, unique: true },
    password: { type: 'VARCHAR(255)', notNull: true },
    created_at: { type: 'TIMESTAMP', default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
