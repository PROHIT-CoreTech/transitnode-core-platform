const tenantContext = require('../../utils/tenantContext');

module.exports = function tenantPlugin(schema) {
  const applyTenantScope = function (next) {
    if (!this.model || !this.model.schema.path('tenantId')) {
      return next();
    }

    const tenantId = tenantContext.getStore();
    
    if (tenantId && !this.getOptions().bypassTenantScope) {
      this.where({ tenantId });
    }
    
    next();
  };

  schema.pre('find', applyTenantScope);
  schema.pre('findOne', applyTenantScope);
  schema.pre('countDocuments', applyTenantScope);
  schema.pre('findOneAndUpdate', applyTenantScope);
  schema.pre('updateMany', applyTenantScope);
  schema.pre('updateOne', applyTenantScope);
  schema.pre('deleteMany', applyTenantScope);
  schema.pre('deleteOne', applyTenantScope);
};
