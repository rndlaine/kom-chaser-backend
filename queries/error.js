const handleSyncError = (error) => {
  if (error && !error.message.includes('duplicate key value violates')) throw error;
};

module.exports = { handleSyncError };
