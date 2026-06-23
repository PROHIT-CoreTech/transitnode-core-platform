import React from 'react';
import AccountantLRForm from './AccountantLRForm';
import InfinityInvoiceForm from './InfinityInvoiceForm';
import ShreepatiInvoiceForm from './ShreepatiInvoiceForm';

const AccountantInvoiceForm = (props) => {
  if (props.templateType === 'BILL_OF_SUPPLY') {
    return <InfinityInvoiceForm {...props} />;
  }
  
  if (props.templateType === 'SIMPLIFIED_3_COL') {
    return <ShreepatiInvoiceForm {...props} />;
  }

  // Default to Sarthak Lorry Receipt Form
  return <AccountantLRForm {...props} />;
};

export default AccountantInvoiceForm;
