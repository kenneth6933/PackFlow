export const adminMenuGroups=[{id:'management',label:'Management',pages:['products','people','issues','audit']},{id:'records',label:'Records',pages:['outstanding','lossreview','deliveries','collections','deleted']}];
export const primaryAdminPages=['overview','confirmations','payroll'];
export const groupForPage=page=>adminMenuGroups.find(g=>g.pages.includes(page))?.id;
