import React from 'react';
import SarthakMasterInvoiceForm from './SarthakMasterInvoiceForm';
import InfinityMasterInvoiceForm from './InfinityMasterInvoiceForm';
import ShreepatiMasterInvoiceForm from './ShreepatiMasterInvoiceForm';

const AccountantMasterInvoiceForm = (props) => {
  if (props.templateType === 'BILL_OF_SUPPLY') {
    return <InfinityMasterInvoiceForm {...props} />;
  }
  
  if (props.templateType === 'SIMPLIFIED_3_COL') {
    return <ShreepatiMasterInvoiceForm {...props} />;
  }

  // Default to TAX_INVOICE
  return <SarthakMasterInvoiceForm {...props} />;
};

export default AccountantMasterInvoiceForm;
