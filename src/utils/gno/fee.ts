export const getGnoFeeStepNames = (alternativeGasRate?: string[]): string[] => {
  const names: string[] = [];
  const len = alternativeGasRate?.length || 0;

  for (let i = 0; i < len; i++) {
    const rate = alternativeGasRate![i];
    if (rate === '0') {
      names.push('Free');
    } else {
      switch (len) {
        case 1:
          names.push('Fixed');
          break;
        case 2:
          names.push(i === 0 ? 'Tiny' : 'Average');
          break;
        case 3:
          names.push(['Tiny', 'Low', 'Average'][i]);
          break;
        default:
          names.push('Fee');
      }
    }
  }

  return names;
};
