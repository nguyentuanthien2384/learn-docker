import { DockerLogo } from '@/components/ui/DockerLogo'

const SOCIAL_LINKS = [
  { key: 'website', label: 'Website', href: 'https://hoidanit.vn' },
  { key: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@hoidanit' },
  { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/askITwithERIC' },
]

export function Footer() {
  return (
    <footer className="border-t border-bd bg-hdr">
      <div className="max-w-[1220px] mx-auto px-5 py-8 flex items-start justify-between gap-6 flex-wrap">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <DockerLogo className="w-[22px] h-[17px] shrink-0" />
            <div className="font-bold text-sm tracking-tight text-tx">@hoidanit</div>
          </div>
          <div className="text-[13px] text-mut max-w-[52ch] [text-wrap:pretty]">
            Cẩm nang Docker và kho prompt AI.
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-start">
          <div className="flex items-baseline gap-2 flex-wrap text-[13px] text-mut2">
            <span>
              Được tạo bởi <span className="text-tx font-semibold">Hỏi Dân IT</span>
            </span>
            <span className="font-mono text-acc">@hoidanit</span>
          </div>
          <div className="flex gap-2 flex-wrap mt-1">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bd2 text-[12.5px] text-tx2 hover:border-acc hover:text-acc"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
