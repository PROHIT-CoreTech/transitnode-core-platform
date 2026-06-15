module.exports = function tenantGuard(schema) {
  schema.pre('save', function (next) {
    // Only apply to models that define a tenantId in their schema
    if (this.schema.path('tenantId')) {
      if (!this.tenantId) {
        const error = new Error('Database Write Aborted: Missing tenant isolation identifier token.');
        return next(error);
      }
    }
    next();
  });

  // Optional: Also guard findOneAndUpdate, updateOne, updateMany, etc. 
  // if you want to strictly prevent updates that remove tenantId.
};
