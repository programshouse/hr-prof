/**

 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {number} 
 */
export const calculateContractDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                  (end.getMonth() - start.getMonth());
    
    return Math.max(0, months); 
  } catch (error) {
    console.error('Error calculating contract duration:', error);
    return null;
  }
};

/**
 * @param {Object} details 
 * @returns {Object} 
 */
export const updateContractDuration = (details) => {
  if (!details?.contract) return details;
  
  const { join_date, end_date } = details.contract;
  const contract_duration = calculateContractDuration(join_date, end_date);
  
  return {
    ...details,
    contract: {
      ...details.contract,
      contract_duration: contract_duration !== null ? contract_duration : details.contract.contract_duration
    }
  };
};
