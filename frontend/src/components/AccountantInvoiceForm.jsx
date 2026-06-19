import React from 'react';
import SarthakInvoiceForm from './SarthakInvoiceForm';
import InfinityInvoiceForm from './InfinityInvoiceForm';
import ShreepatiInvoiceForm from './ShreepatiInvoiceForm';

const AccountantInvoiceForm = (props) => {
  if (props.templateType === 'BILL_OF_SUPPLY') {
    return <InfinityInvoiceForm {...props} />;
  }
  
  if (props.templateType === 'SIMPLIFIED_3_COL') {
    return <ShreepatiInvoiceForm {...props} />;
  }

  // Default to TAX_INVOICE
  return <SarthakInvoiceForm {...props} />;
};

export default AccountantInvoiceForm;
