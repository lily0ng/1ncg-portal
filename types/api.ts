import { 
  VirtualMachine, Volume, Network, VPC, Template, ISO, 
  ServiceOffering, DiskOffering, Zone, UsageRecord, Snapshot,
  Backup, SSHKeyPair, AffinityGroup, PublicIPAddress, LoadBalancerRule,
  FirewallRule, VPNGateway, VPNConnection, KubernetesCluster, AutoScaleVMGroup,
  Project, Account, Domain, Event, Alert
} from './cloudstack'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  count: number
  page?: number
  pageSize?: number
}

export interface VMsResponse {
  vms: VirtualMachine[]
  count: number
}

export interface VolumesResponse {
  volumes: Volume[]
  count: number
}

export interface NetworksResponse {
  networks: Network[]
  count: number
}

export interface VPCsResponse {
  vpcs: VPC[]
  count: number
}

export interface TemplatesResponse {
  templates: Template[]
  count: number
}

export interface ISOsResponse {
  isos: ISO[]
  count: number
}

export interface ServiceOfferingsResponse {
  offerings: ServiceOffering[]
  count: number
}

export interface DiskOfferingsResponse {
  offerings: DiskOffering[]
  count: number
}

export interface ZonesResponse {
  zones: Zone[]
  count: number
}

export interface UsageResponse {
  records: UsageRecord[]
  summary: {
    total: number
    byType: Record<string, number>
    byAccount: Record<string, number>
  }
  period: {
    start: string
    end: string
  }
}

export interface SnapshotsResponse {
  snapshots: Snapshot[]
  count: number
}

export interface BackupsResponse {
  backups: Backup[]
  count: number
}

export interface SSHKeysResponse {
  keys: SSHKeyPair[]
  count: number
}

export interface AffinityGroupsResponse {
  groups: AffinityGroup[]
  count: number
}

export interface PublicIPsResponse {
  ips: PublicIPAddress[]
  count: number
}

export interface LoadBalancerRulesResponse {
  rules: LoadBalancerRule[]
  count: number
}

export interface FirewallRulesResponse {
  rules: FirewallRule[]
  count: number
}

export interface VPNGatewaysResponse {
  gateways: VPNGateway[]
  count: number
}

export interface VPNConnectionsResponse {
  connections: VPNConnection[]
  count: number
}

export interface KubernetesClustersResponse {
  clusters: KubernetesCluster[]
  count: number
}

export interface AutoScaleGroupsResponse {
  groups: AutoScaleVMGroup[]
  count: number
}

export interface ProjectsResponse {
  projects: Project[]
  count: number
}

export interface AccountsResponse {
  accounts: Account[]
  count: number
}

export interface DomainsResponse {
  domains: Domain[]
  count: number
}

export interface EventsResponse {
  events: Event[]
  count: number
}

export interface AlertsResponse {
  alerts: Alert[]
  count: number
}

export interface SyncResponse {
  success: boolean
  synced: {
    zones: number
    vms: number
    volumes: number
    networks: number
    offerings: number
  }
}

export interface ConsoleResponse {
  url: string
}

export interface JobResult<T = any> {
  jobid: string
  jobresult?: T
  jobstatus?: number
}
