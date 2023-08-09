import { ContextApi } from "@pancakeswap/localization";
import { FooterLinkType } from "../../../components/Footer/types";

export const footerLinks: (t: ContextApi["t"]) => FooterLinkType[] = (t) => [
  {
    label: t("About"),
    items: [
      {
        label: t("Contact"),
        href: "https://docs.plaxswap.io/contact-us",
        isHighlighted: true,
      },
      // {
      //   label: t("Brand"),
      //   href: "https://docs.plaxswap.io/brand",
      // },
      // {
      //   label: t("Blog"),
      //   href: "https://blog.plaxswap.io/",
      // },
      {
        label: t("Community"),
        href: "https://docs.plaxswap.io/contact-us/telegram",
      },
      {
        label: t("Litepaper"),
        href: "https://v2litepaper.plaxswap.io/",
      },
    ],
  },
  {
    label: t("Help"),
    items: [
      {
        label: t("Customer Support"),
        href: "https://docs.plaxswap.io/contact-us",
      },
      // {
      //   label: t("Troubleshooting"),
      //   href: "https://docs.plaxswap.io/help/troubleshooting",
      // },
      {
        label: t("Guides"),
        href: "https://docs.plaxswap.io/get-started",
      },
    ],
  },
  {
    label: t("Developers"),
    items: [
      // {
      //   label: "Github",
      //   href: "https://github.com/pancakeswap",
      // },
      {
        label: t("Documentation"),
        href: "https://docs.plaxswap.io",
      },
      // {
      //   label: t("Bug Bounty"),
      //   href: "https://docs.plaxswap.io/code/bug-bounty",
      // },
      {
        label: t("Audits"),
        href: "https://docs.plaxswap.io/audit",
      },
      // {
      //   label: t("Careers"),
      //   href: "https://docs.plaxswap.io/hiring/become-a-chef",
      // },
    ],
  },
];
