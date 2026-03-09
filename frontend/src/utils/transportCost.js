const RATE_PER_KM = {
  mini:   20,   // < 10 quintals
  medium: 16,   // 10–50 quintals
  large:  12,   // > 50 quintals
};

const LOADING_UNLOADING = 500;
const TOLL_PER_100KM    = 150;

export const calculateTransportCost = (distanceKm, quantityQuintals) => {
  const truckType =
    quantityQuintals < 10  ? "mini"   :
    quantityQuintals <= 50 ? "medium" : "large";

  const ratePerKm = RATE_PER_KM[truckType];
  const fuelCost  = Math.round(distanceKm * ratePerKm);
  const tollCost  = Math.round((distanceKm / 100) * TOLL_PER_100KM);
  const totalCost = fuelCost + tollCost + LOADING_UNLOADING;

  return {
    totalCost,
    breakdown: { fuelCost, tollCost, loadingCost: LOADING_UNLOADING },
    truckType,
    distanceKm,
  };
};
