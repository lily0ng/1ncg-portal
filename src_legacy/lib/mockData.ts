import {
  VM,
  Volume,
  Network,
  VPC,
  Zone,
  Template,
  ServiceOffering,
  User,
  Invoice,
  MarketplaceApp } from
'../types/cloudstack';

export const mockVMs: VM[] = [
{
  id: 'vm-1',
  name: 'web-server-01',
  state: 'Running',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.10',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2023-10-01T10:00:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-2',
  name: 'db-server-01',
  state: 'Running',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.11',
  cpunumber: 8,
  memory: 16384,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2023-10-02T11:00:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-3',
  name: 'test-env-1',
  state: 'Stopped',
  zonename: 'eu-west-1',
  ipaddress: '10.0.0.5',
  cpunumber: 2,
  memory: 4096,
  osdisplayname: 'CentOS 8',
  created: '2023-11-15T09:30:00Z',
  templateid: 'tmpl-2',
  account: 'user1',
  domain: 'ROOT'
},
{
  id: 'vm-4',
  name: 'k8s-master',
  state: 'Running',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.20',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2023-12-01T14:20:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-5',
  name: 'k8s-worker-1',
  state: 'Running',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.21',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2023-12-01T14:25:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-6',
  name: 'k8s-worker-2',
  state: 'Error',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.22',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2023-12-01T14:30:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-7',
  name: 'legacy-app',
  state: 'Running',
  zonename: 'ap-south-1',
  ipaddress: '172.16.0.10',
  cpunumber: 2,
  memory: 4096,
  osdisplayname: 'Windows Server 2019',
  created: '2023-08-10T08:00:00Z',
  templateid: 'tmpl-3',
  account: 'user2',
  domain: 'ROOT'
},
{
  id: 'vm-8',
  name: 'dev-box-john',
  state: 'Stopped',
  zonename: 'eu-west-1',
  ipaddress: '10.0.0.15',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-01-05T10:15:00Z',
  templateid: 'tmpl-1',
  account: 'user1',
  domain: 'ROOT'
},
{
  id: 'vm-9',
  name: 'dev-box-jane',
  state: 'Running',
  zonename: 'eu-west-1',
  ipaddress: '10.0.0.16',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-01-05T10:20:00Z',
  templateid: 'tmpl-1',
  account: 'user1',
  domain: 'ROOT'
},
{
  id: 'vm-10',
  name: 'analytics-engine',
  state: 'Starting',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.50',
  cpunumber: 16,
  memory: 32768,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-02-10T09:00:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-11',
  name: 'old-backup-server',
  state: 'Destroyed',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.99',
  cpunumber: 2,
  memory: 4096,
  osdisplayname: 'CentOS 7',
  created: '2022-05-01T00:00:00Z',
  templateid: 'tmpl-4',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-12',
  name: 'staging-web',
  state: 'Running',
  zonename: 'ap-south-1',
  ipaddress: '172.16.0.20',
  cpunumber: 2,
  memory: 4096,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-03-01T11:00:00Z',
  templateid: 'tmpl-1',
  account: 'user2',
  domain: 'ROOT'
},
{
  id: 'vm-13',
  name: 'staging-db',
  state: 'Running',
  zonename: 'ap-south-1',
  ipaddress: '172.16.0.21',
  cpunumber: 4,
  memory: 8192,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-03-01T11:05:00Z',
  templateid: 'tmpl-1',
  account: 'user2',
  domain: 'ROOT'
},
{
  id: 'vm-14',
  name: 'ci-runner-1',
  state: 'Running',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.60',
  cpunumber: 8,
  memory: 16384,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-03-15T08:00:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
},
{
  id: 'vm-15',
  name: 'ci-runner-2',
  state: 'Stopping',
  zonename: 'us-east-1',
  ipaddress: '192.168.1.61',
  cpunumber: 8,
  memory: 16384,
  osdisplayname: 'Ubuntu 22.04 LTS',
  created: '2024-03-15T08:05:00Z',
  templateid: 'tmpl-1',
  account: 'admin',
  domain: 'ROOT'
}];


export const mockVolumes: Volume[] = [
{
  id: 'vol-1',
  name: 'ROOT-123',
  state: 'Ready',
  type: 'ROOT',
  size: 20,
  vmname: 'web-server-01',
  zonename: 'us-east-1',
  created: '2023-10-01T10:00:00Z',
  account: 'admin'
},
{
  id: 'vol-2',
  name: 'DATA-123',
  state: 'Ready',
  type: 'DATADISK',
  size: 100,
  vmname: 'web-server-01',
  zonename: 'us-east-1',
  created: '2023-10-01T10:05:00Z',
  account: 'admin'
},
{
  id: 'vol-3',
  name: 'ROOT-124',
  state: 'Ready',
  type: 'ROOT',
  size: 50,
  vmname: 'db-server-01',
  zonename: 'us-east-1',
  created: '2023-10-02T11:00:00Z',
  account: 'admin'
},
{
  id: 'vol-4',
  name: 'DATA-124',
  state: 'Ready',
  type: 'DATADISK',
  size: 500,
  vmname: 'db-server-01',
  zonename: 'us-east-1',
  created: '2023-10-02T11:05:00Z',
  account: 'admin'
},
{
  id: 'vol-5',
  name: 'ROOT-125',
  state: 'Ready',
  type: 'ROOT',
  size: 20,
  vmname: 'test-env-1',
  zonename: 'eu-west-1',
  created: '2023-11-15T09:30:00Z',
  account: 'user1'
},
{
  id: 'vol-6',
  name: 'ROOT-126',
  state: 'Ready',
  type: 'ROOT',
  size: 20,
  vmname: 'k8s-master',
  zonename: 'us-east-1',
  created: '2023-12-01T14:20:00Z',
  account: 'admin'
},
{
  id: 'vol-7',
  name: 'ROOT-127',
  state: 'Ready',
  type: 'ROOT',
  size: 20,
  vmname: 'k8s-worker-1',
  zonename: 'us-east-1',
  created: '2023-12-01T14:25:00Z',
  account: 'admin'
},
{
  id: 'vol-8',
  name: 'ROOT-128',
  state: 'Ready',
  type: 'ROOT',
  size: 20,
  vmname: 'k8s-worker-2',
  zonename: 'us-east-1',
  created: '2023-12-01T14:30:00Z',
  account: 'admin'
},
{
  id: 'vol-9',
  name: 'unattached-data-1',
  state: 'Allocated',
  type: 'DATADISK',
  size: 200,
  zonename: 'us-east-1',
  created: '2024-01-10T10:00:00Z',
  account: 'admin'
},
{
  id: 'vol-10',
  name: 'ROOT-129',
  state: 'Destroyed',
  type: 'ROOT',
  size: 20,
  vmname: 'old-backup-server',
  zonename: 'us-east-1',
  created: '2022-05-01T00:00:00Z',
  account: 'admin'
}];


export const mockNetworks: Network[] = [
{
  id: 'net-1',
  name: 'VPC-Tier-Web',
  state: 'Implemented',
  type: 'Isolated',
  cidr: '192.168.1.0/24',
  zonename: 'us-east-1',
  account: 'admin',
  created: '2023-09-01T10:00:00Z'
},
{
  id: 'net-2',
  name: 'VPC-Tier-DB',
  state: 'Implemented',
  type: 'Isolated',
  cidr: '192.168.2.0/24',
  zonename: 'us-east-1',
  account: 'admin',
  created: '2023-09-01T10:05:00Z'
},
{
  id: 'net-3',
  name: 'DefaultSharedNetwork',
  state: 'Implemented',
  type: 'Shared',
  cidr: '10.0.0.0/22',
  zonename: 'eu-west-1',
  account: 'system',
  created: '2023-01-01T00:00:00Z'
},
{
  id: 'net-4',
  name: 'Dev-Net-1',
  state: 'Implemented',
  type: 'Isolated',
  cidr: '172.16.0.0/24',
  zonename: 'ap-south-1',
  account: 'user2',
  created: '2023-08-01T09:00:00Z'
},
{
  id: 'net-5',
  name: 'K8s-Pod-Net',
  state: 'Implemented',
  type: 'Isolated',
  cidr: '10.244.0.0/16',
  zonename: 'us-east-1',
  account: 'admin',
  created: '2023-12-01T14:00:00Z'
},
{
  id: 'net-6',
  name: 'K8s-Svc-Net',
  state: 'Implemented',
  type: 'Isolated',
  cidr: '10.96.0.0/12',
  zonename: 'us-east-1',
  account: 'admin',
  created: '2023-12-01T14:05:00Z'
},
{
  id: 'net-7',
  name: 'Test-Net-Allocated',
  state: 'Allocated',
  type: 'Isolated',
  cidr: '192.168.100.0/24',
  zonename: 'us-east-1',
  account: 'user1',
  created: '2024-04-01T10:00:00Z'
},
{
  id: 'net-8',
  name: 'Legacy-Net',
  state: 'Setup',
  type: 'L2',
  cidr: '',
  zonename: 'eu-west-1',
  account: 'admin',
  created: '2022-01-01T00:00:00Z'
}];


export const mockVPCs: VPC[] = [
{
  id: 'vpc-1',
  name: 'Prod-VPC',
  state: 'Enabled',
  cidr: '192.168.0.0/16',
  zonename: 'us-east-1',
  networkcount: 2,
  created: '2023-09-01T09:00:00Z'
},
{
  id: 'vpc-2',
  name: 'Dev-VPC',
  state: 'Enabled',
  cidr: '10.10.0.0/16',
  zonename: 'eu-west-1',
  networkcount: 1,
  created: '2023-11-01T10:00:00Z'
},
{
  id: 'vpc-3',
  name: 'Staging-VPC',
  state: 'Enabled',
  cidr: '172.16.0.0/16',
  zonename: 'ap-south-1',
  networkcount: 1,
  created: '2024-02-01T08:00:00Z'
},
{
  id: 'vpc-4',
  name: 'K8s-VPC',
  state: 'Enabled',
  cidr: '10.0.0.0/8',
  zonename: 'us-east-1',
  networkcount: 2,
  created: '2023-12-01T13:00:00Z'
},
{
  id: 'vpc-5',
  name: 'Old-VPC',
  state: 'Disabled',
  cidr: '192.168.0.0/16',
  zonename: 'us-east-1',
  networkcount: 0,
  created: '2022-06-01T00:00:00Z'
}];


export const mockZones: Zone[] = [
{
  id: 'zone-1',
  name: 'us-east-1',
  allocationstate: 'Enabled',
  networktype: 'Advanced'
},
{
  id: 'zone-2',
  name: 'eu-west-1',
  allocationstate: 'Enabled',
  networktype: 'Advanced'
},
{
  id: 'zone-3',
  name: 'ap-south-1',
  allocationstate: 'Enabled',
  networktype: 'Basic'
}];


export const mockUsers: User[] = [
{
  id: 'u-1',
  username: 'admin',
  email: 'admin@cloud.local',
  role: 'admin',
  account: 'admin',
  domainId: 'ROOT'
},
{
  id: 'u-2',
  username: 'user1',
  email: 'user1@company.com',
  role: 'user',
  account: 'user1',
  domainId: 'ROOT'
},
{
  id: 'u-3',
  username: 'user2',
  email: 'user2@startup.io',
  role: 'user',
  account: 'user2',
  domainId: 'ROOT'
}];


export const mockTemplates: Template[] = [
{ id: 'tmpl-1', name: 'Ubuntu 22.04 LTS', displaytext: 'Ubuntu 22.04 LTS (64-bit)', isready: true, ostypename: 'Ubuntu 22.04', created: '2023-01-01T00:00:00Z' },
{ id: 'tmpl-2', name: 'CentOS 8', displaytext: 'CentOS 8 Stream (64-bit)', isready: true, ostypename: 'CentOS 8', created: '2023-01-01T00:00:00Z' },
{ id: 'tmpl-3', name: 'Windows Server 2019', displaytext: 'Windows Server 2019 Datacenter', isready: true, ostypename: 'Windows Server 2019', created: '2023-01-01T00:00:00Z' },
{ id: 'tmpl-4', name: 'CentOS 7', displaytext: 'CentOS 7 (64-bit) - Legacy', isready: true, ostypename: 'CentOS 7', created: '2022-01-01T00:00:00Z' },
{ id: 'tmpl-5', name: 'Debian 12', displaytext: 'Debian 12 Bookworm (64-bit)', isready: true, ostypename: 'Debian 12', created: '2023-06-01T00:00:00Z' },
{ id: 'tmpl-6', name: 'Rocky Linux 9', displaytext: 'Rocky Linux 9 (64-bit)', isready: true, ostypename: 'Rocky Linux 9', created: '2023-03-01T00:00:00Z' },
{ id: 'tmpl-7', name: 'Alpine Linux 3.18', displaytext: 'Alpine Linux 3.18 (minimal)', isready: true, ostypename: 'Alpine Linux', created: '2023-07-01T00:00:00Z' },
{ id: 'tmpl-8', name: 'Fedora 39', displaytext: 'Fedora 39 Workstation', isready: false, ostypename: 'Fedora 39', created: '2024-01-01T00:00:00Z' }];


export const mockServiceOfferings: ServiceOffering[] = [
{ id: 'so-1', name: 'Small Instance', displaytext: '1 vCPU, 1 GB RAM', cpunumber: 1, cpuspeed: 2000, memory: 1024 },
{ id: 'so-2', name: 'Medium Instance', displaytext: '2 vCPU, 4 GB RAM', cpunumber: 2, cpuspeed: 2000, memory: 4096 },
{ id: 'so-3', name: 'Large Instance', displaytext: '4 vCPU, 8 GB RAM', cpunumber: 4, cpuspeed: 2000, memory: 8192 },
{ id: 'so-4', name: 'XL Instance', displaytext: '8 vCPU, 16 GB RAM', cpunumber: 8, cpuspeed: 2000, memory: 16384 },
{ id: 'so-5', name: '2XL Instance', displaytext: '16 vCPU, 32 GB RAM', cpunumber: 16, cpuspeed: 2000, memory: 32768 },
{ id: 'so-6', name: 'Micro Instance', displaytext: '1 vCPU, 512 MB RAM', cpunumber: 1, cpuspeed: 1000, memory: 512 },
{ id: 'so-7', name: 'GPU Instance', displaytext: '8 vCPU, 32 GB RAM + GPU', cpunumber: 8, cpuspeed: 3000, memory: 32768 },
{ id: 'so-8', name: 'High Memory', displaytext: '4 vCPU, 32 GB RAM', cpunumber: 4, cpuspeed: 2000, memory: 32768 }];


export const mockInvoices: Invoice[] = [
{ id: 'inv-1', account: 'admin', amount: 1250.00, status: 'Paid', month: '2024-01', created: '2024-02-01T00:00:00Z' },
{ id: 'inv-2', account: 'admin', amount: 1380.50, status: 'Paid', month: '2024-02', created: '2024-03-01T00:00:00Z' },
{ id: 'inv-3', account: 'admin', amount: 1425.00, status: 'Paid', month: '2024-03', created: '2024-04-01T00:00:00Z' },
{ id: 'inv-4', account: 'user1', amount: 185.50, status: 'Paid', month: '2024-01', created: '2024-02-01T00:00:00Z' },
{ id: 'inv-5', account: 'user1', amount: 210.00, status: 'Paid', month: '2024-02', created: '2024-03-01T00:00:00Z' },
{ id: 'inv-6', account: 'user1', amount: 195.75, status: 'Unpaid', month: '2024-03', created: '2024-04-01T00:00:00Z' },
{ id: 'inv-7', account: 'user2', amount: 320.00, status: 'Paid', month: '2024-01', created: '2024-02-01T00:00:00Z' },
{ id: 'inv-8', account: 'user2', amount: 345.25, status: 'Overdue', month: '2024-02', created: '2024-03-01T00:00:00Z' },
{ id: 'inv-9', account: 'user2', amount: 290.00, status: 'Unpaid', month: '2024-03', created: '2024-04-01T00:00:00Z' },
{ id: 'inv-10', account: 'admin', amount: 1520.00, status: 'Unpaid', month: '2024-04', created: '2024-05-01T00:00:00Z' }];


export const mockMarketplaceApps: MarketplaceApp[] = [
{ id: 'app-1', name: 'WordPress', description: 'Popular CMS for blogs and websites', icon: '📝', price: 0, category: 'CMS' },
{ id: 'app-2', name: 'GitLab CE', description: 'Self-hosted Git repository management', icon: '🦊', price: 0, category: 'DevOps' },
{ id: 'app-3', name: 'Nextcloud', description: 'Self-hosted file sync and share', icon: '☁️', price: 0, category: 'Storage' },
{ id: 'app-4', name: 'Grafana', description: 'Analytics and monitoring dashboards', icon: '📊', price: 0, category: 'Monitoring' },
{ id: 'app-5', name: 'Jenkins', description: 'Open-source automation server', icon: '🔧', price: 0, category: 'DevOps' },
{ id: 'app-6', name: 'Redis', description: 'In-memory data structure store', icon: '🔴', price: 0, category: 'Database' },
{ id: 'app-7', name: 'PostgreSQL', description: 'Advanced open-source database', icon: '🐘', price: 0, category: 'Database' },
{ id: 'app-8', name: 'Nginx', description: 'High-performance web server', icon: '🌐', price: 0, category: 'Web Server' },
{ id: 'app-9', name: 'Kubernetes Dashboard', description: 'Web UI for Kubernetes clusters', icon: '⚙️', price: 5.00, category: 'DevOps' },
{ id: 'app-10', name: 'Mattermost', description: 'Open-source team messaging', icon: '💬', price: 0, category: 'Communication' },
{ id: 'app-11', name: 'Prometheus', description: 'Systems monitoring and alerting', icon: '🔥', price: 0, category: 'Monitoring' },
{ id: 'app-12', name: 'MinIO', description: 'High-performance object storage', icon: '📦', price: 0, category: 'Storage' }];