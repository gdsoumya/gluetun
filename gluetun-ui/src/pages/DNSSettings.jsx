import ServicePanel from '../components/ServicePanel';

const DNSSettings = () => (
  <ServicePanel
    title="DNS"
    endpoint="/v1/dns/status"
    infoTitle="About the DNS service"
    info="Gluetun runs its own DNS resolver inside the tunnel, with support for
      encrypted upstreams (DoT/DoH), caching, malicious host blocking and
      local network name resolution."
    note="DNS upstreams and blocklists are configured through environment
      variables on the container. This panel only starts or stops the resolver."
  />
);

export default DNSSettings;
