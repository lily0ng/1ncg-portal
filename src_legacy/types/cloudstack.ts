export interface VM {
  id: string;
  name: string;
  state: 'Running' | 'Stopped' | 'Error' | 'Starting' | 'Stopping' | 'Destroyed';
  zonename: string;
  ipaddress: string;
  cpunumber: number;
  memory: number;
  osdisplayname: string;
  created: string;
  templateid: string;
  account: string;
  domain: string;
}

export interface Volume {
  id: string;
  name: string;
  state: 'Allocated' | 'Ready' | 'Destroyed';
  type: 'ROOT' | 'DATADISK';
  size: number;
  vmname?: string;
  zonename: string;
  created: string;
  account: string;
}

export interface Network {
  id: string;
  name: string;
  state: 'Implemented' | 'Allocated' | 'Setup';
  type: 'Isolated' | 'Shared' | 'L2';
  cidr: string;
  zonename: string;
  account: string;
  created: string;
}

export interface VPC {
  id: string;
  name: string;
  state: 'Enabled' | 'Disabled';
  cidr: string;
  zonename: string;
  networkcount: number;
  created: string;
}

export interface Zone {
  id: string;
  name: string;
  allocationstate: 'Enabled' | 'Disabled';
  networktype: 'Advanced' | 'Basic';
}

export interface Template {
  id: string;
  name: string;
  displaytext: string;
  isready: boolean;
  ostypename: string;
  created: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
  displaytext: string;
  cpunumber: number;
  cpuspeed: number;
  memory: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  account: string;
  domainId: string;
}

export interface Invoice {
  id: string;
  account: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  month: string;
  created: string;
}

export interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string;
}