export interface VirtualMachine {
  id: string
  name: string
  displayname?: string
  state: 'Running' | 'Stopped' | 'Destroyed' | 'Error' | 'Starting' | 'Stopping'
  templatename?: string
  serviceofferingname?: string
  zonename?: string
  cpuused?: string
  memory?: number
  memoryintfreekbs?: number
  networkkbsread?: number
  networkkbswrite?: number
  created?: string
  ipaddress?: string
  account?: string
  domain?: string
}

export interface Volume {
  id: string
  name: string
  type: 'ROOT' | 'DATADISK'
  state: 'Ready' | 'Allocated' | 'Destroyed'
  size: number
  virtualmachineid?: string
  vmname?: string
  zonename?: string
  diskofferingname?: string
  created?: string
}

export interface Network {
  id: string
  name: string
  state: 'Implemented' | 'Setup' | 'Destroyed'
  cidr?: string
  gateway?: string
  type?: string
  networkofferingname?: string
  vpcid?: string
  vpcname?: string
  account?: string
  domain?: string
  zonename?: string
}

export interface VPC {
  id: string
  name: string
  state: 'Enabled' | 'Inactive'
  cidr: string
  displaytext?: string
  vpcofferingname?: string
  account?: string
  domain?: string
  zonename?: string
  networkdomain?: string
  created?: string
  restartrequired?: boolean
  sourceNATIP?: string
}

export interface Template {
  id: string
  name: string
  displaytext?: string
  isready: boolean
  status?: string
  hypervisor?: string
  format?: string
  size?: number
  created?: string
  crossZones?: boolean
  ispublic?: boolean
  isfeatured?: boolean
}

export interface ISO {
  id: string
  name: string
  displaytext?: string
  isready: boolean
  size?: number
  bootable?: boolean
  ispublic?: boolean
  created?: string
}

export interface ServiceOffering {
  id: string
  name: string
  displaytext?: string
  cpunumber: number
  cpuspeed: number
  memory: number
  offerha?: boolean
  limitcpuuse?: boolean
  isvolatile?: boolean
  issystem?: boolean
  defaultuse?: boolean
  systemvmtype?: string
}

export interface DiskOffering {
  id: string
  name: string
  displaytext?: string
  disksize?: number
  storagetype?: string
  provisioningtype?: string
  customdisksize?: boolean
  isvolatile?: boolean
  cachemode?: string
}

export interface Zone {
  id: string
  name: string
  description?: string
  dns1?: string
  dns2?: string
  internaldns1?: string
  internaldns2?: string
  networktype?: 'Basic' | 'Advanced'
  securitygroupsenabled?: boolean
  allocationstate?: 'Enabled' | 'Disabled'
  localstorageenabled?: boolean
}

export interface UsageRecord {
  account: string
  accountid: string
  domain?: string
  domainid?: string
  zone?: string
  zoneid?: string
  description?: string
  usage?: string
  usagetype: number
  rawusage: string
  virtualmachineid?: string
  vmname?: string
  offertype?: string
  offeringid?: string
  size?: number
  startdate?: string
  enddate?: string
  cost?: number
}

export interface Snapshot {
  id: string
  name: string
  volumeid?: string
  volumename?: string
  state: 'BackedUp' | 'Creating' | 'Destroyed'
  revertable?: boolean
  created?: string
  intervaltype?: string
  physicalsize?: number
}

export interface Backup {
  id: string
  name: string
  volumeid?: string
  volumename?: string
  state: 'BackedUp' | 'Allocating' | 'Destroyed'
  created?: string
  size?: number
  zoneid?: string
  zonename?: string
}

export interface SSHKeyPair {
  name: string
  fingerprint?: string
  privatekey?: string
  domainid?: string
  domain?: string
  account?: string
}

export interface AffinityGroup {
  id: string
  name: string
  description?: string
  type?: string
  virtualmachineids?: string[]
}

export interface PublicIPAddress {
  id: string
  ipaddress: string
  state?: string
  allocated?: string
  networkid?: string
  networkname?: string
  vpcid?: string
  vpcname?: string
  virtualmachineid?: string
  virtualmachinename?: string
  issourcenat?: boolean
  isstaticnat?: boolean
}

export interface LoadBalancerRule {
  id: string
  name: string
  publicport: number
  privateport: number
  algorithm?: string
  publicipid?: string
  publicip?: string
  state?: string
  cidrlist?: string
  networkid?: string
}

export interface FirewallRule {
  id: string
  protocol: string
  startport?: number
  endport?: number
  cidrlist?: string
  state?: string
  ipaddressid?: string
  ipaddress?: string
}

export interface VPNGateway {
  id: string
  publicip: string
  vpcid?: string
  state?: string
}

export interface VPNConnection {
  id: string
  publicip: string
  gateway?: string
  state?: string
  cidrlist?: string
  ipsecpsk?: string
  account?: string
  domain?: string
}

export interface KubernetesCluster {
  id: string
  name: string
  state: 'Running' | 'Stopped' | 'Destroyed' | 'Creating' | 'Error'
  size: number
  masternodes?: number
  workernodes?: number
  cidr?: string
  kubernetesversion?: string
  zonename?: string
  account?: string
  domain?: string
  created?: string
}

export interface AutoScaleVMGroup {
  id: string
  name: string
  state?: string
  minmembers?: number
  maxmembers?: number
  interval?: number
  scaledownpolicyids?: string
  scaleuppolicyids?: string
  vmprofileid?: string
  account?: string
  domain?: string
  zonename?: string
}

export interface Project {
  id: string
  name: string
  displaytext?: string
  state?: 'Active' | 'Inactive' | 'Disabled'
  account?: string
  domain?: string
  domainid?: string
  owner?: string
  created?: string
}

export interface Account {
  id: string
  name: string
  accounttype?: number
  domain?: string
  domainid?: string
  role?: string
  rolename?: string
  email?: string
  state?: 'enabled' | 'disabled' | 'locked'
  created?: string
  networkdomain?: string
  vmlimit?: number
  iplimit?: number
  volumelimit?: number
  snapshotlimit?: number
  templatelimit?: number
  vpclimit?: number
  cpulimit?: number
  memorylimit?: number
  networklimit?: number
  primarystoragelimit?: number
  secondarystoragelimit?: number
}

export interface Domain {
  id: string
  name: string
  parentdomainid?: string
  parentdomainname?: string
  level?: number
  path?: string
  haschild?: boolean
  networkdomain?: string
}

export interface Event {
  id: string
  username?: string
  account?: string
  domain?: string
  created?: string
  type?: string
  level?: 'INFO' | 'WARN' | 'ERROR'
  description?: string
  state?: 'Scheduled' | 'Started' | 'Completed' | 'Failed'
  resourcetype?: string
  resourceid?: string
}

export interface Alert {
  id: string
  description?: string
  sent?: string
  type?: string
  name?: string
}
