import {
  FileText,
  GraduationCap,
  Camera,
  Monitor,
  Plane,
  IdCard,
  Baby,
  FilePenLine,
  ClipboardList,
  School,
  Award,
  Briefcase,
  BookOpen,
  Eraser,
  Sparkles,
  Image as ImageIcon,
  ScanLine,
  Printer,
  File,
  FileType,
  User,
  Clock,
  CheckCircle2,
  Search,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Shield,
  Zap,
  Users,
  Layers,
  BadgeCheck,
  Compass,
  MessageCircle,
  FileCheck,
  Globe,
} from 'lucide-react';
import type { ComponentType } from 'react';

type IconProps = { className?: string };

export const iconMap: Record<string, ComponentType<IconProps>> = {
  files: FileText,
  graduation: GraduationCap,
  camera: Camera,
  monitor: Monitor,
  passport: FileCheck,
  plane: Plane,
  idcard: IdCard,
  baby: Baby,
  'file-pen': FilePenLine,
  form: ClipboardList,
  school: School,
  award: Award,
  'file-text': FileText,
  briefcase: Briefcase,
  book: BookOpen,
  eraser: Eraser,
  sparkles: Sparkles,
  image: ImageIcon,
  scan: ScanLine,
  printer: Printer,
  file: File,
  pdf: FileType,
  user: User,
  clock: Clock,
  check: CheckCircle2,
  globe: Globe,
};

export const uiIcons = {
  search: Search,
  arrowRight: ArrowRight,
  menu: Menu,
  close: X,
  chevronDown: ChevronDown,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  shield: Shield,
  zap: Zap,
  users: Users,
  layers: Layers,
  badgeCheck: BadgeCheck,
  compass: Compass,
  messageCircle: MessageCircle,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || FileText;
  return <Icon className={className} />;
}

export function CategoryIcon({ name, className }: { name: 'files' | 'graduation' | 'camera' | 'monitor'; className?: string }) {
  const Icon = iconMap[name] || FileText;
  return <Icon className={className} />;
}
