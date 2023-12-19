export const ghn = {
  baseShipUrl: 'https://online-gateway.ghn.vn/shiip/public-api',
  baseOrderTrackingUrl:
    'https://online-gateway.ghn.vn/order-tracking/public-api',
  searchOrder: '/v2/shipping-order/search',
  getOrder: '/v2/shipping-order/detail',
  trackingLogs: '/client/tracking-logs',
  token: process.env.GHN_TOKEN,
};
