exports.up = (pgm) => {
  pgm.createTable('anomaly_logs', {
    id: 'id',
    is_anomaly: 'BOOLEAN',
    created_at: { type: 'TIMESTAMP', default: pgm.func('current_timestamp') }
  });
};

exports.down = (pgm) => {
  pgm.dropTable('anomaly_logs');
};
