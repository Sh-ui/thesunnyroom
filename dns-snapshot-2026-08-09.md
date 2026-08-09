# thesunnyroom.co DNS snapshot -- 2026-08-09 (before Netlify cutover)

Captured from GoDaddy DNS Management (Ian's account), 11 records. This is the
rollback reference: restoring the A and www records below returns the domain
to the GoDaddy Website Builder site.

| Type  | Name           | Data                                                        | TTL    |
|-------|----------------|-------------------------------------------------------------|--------|
| A     | @              | WebsiteBuilder Site (GoDaddy-managed value)                 | 1 Hour |
| NS    | @              | ns27.domaincontrol.com.                                     | 1 Hour |
| NS    | @              | ns28.domaincontrol.com.                                     | 1 Hour |
| CNAME | pay            | paylinks.commerce.godaddy.com.                              | 1 Hour |
| CNAME | www            | thesunnyroom.co.                                            | 1 Hour |
| CNAME | _domainconnect | _domainconnect.gd.domaincontrol.com.                        | 1 Hour |
| SOA   | @              | Primary nameserver: ns27.domaincontrol.com.                 | 1 Hour |
| MX    | @              | smtp.google.com. (Priority: 1)                              | 1 Hour |
| TXT   | @              | google-site-verification=GXIetaTfqMzk3Yxf-J7lZBgCUoc39jFKDjBRkeEBv8c | 1 Hour |
| TXT   | @              | v=spf1 include:_spf.google.com ~all                         | 1 Hour |
| TXT   | _dmarc         | v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net; | 1 Hour |

No CAA records exist -- Netlify/Let's Encrypt needs no CAA addition.

## Planned cutover edits (only these two rows change)
- A `@`: WebsiteBuilder Site -> `75.2.60.5`
- CNAME `www`: `thesunnyroom.co.` -> `<sitename>.netlify.app.`

MX/TXT/SPF/DKIM/DMARC and the `pay` CNAME are untouched -- mail keeps flowing.
