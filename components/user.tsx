'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { User as UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type Props = {
  user: {
    email?: string;
    name?: string;
    imageUrl?: string;
    app_metadata?: { provider?: string };
  };
};

const User: React.FC<Props> = ({ user }) => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`
        : user.name.substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return <UserIcon className="h-4 w-4" />;
  };

  const getProviderIcon = () => {
    const provider = user?.app_metadata?.provider;
    if (!provider) return null;

    const providers: Record<string, string> = {
      google: '/icons/google.svg',
      github: '/icons/github.svg',
      facebook: '/icons/facebook.svg',
      twitter: '/icons/twitter.svg',
      apple: '/icons/apple.svg',
    };

    return providers[provider] || null;
  };

  const providerIcon = getProviderIcon();

  return (
    <div className="flex items-center gap-3">
      {user?.email && (
        <div className="hidden md:block text-right">
          <p className="text-sm font-medium text-foreground line-clamp-1">
            {user?.name || user?.email.split('@')[0]}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {user?.email}
          </p>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-10 w-10 border-2 border-primary/10 hover:border-primary/30 transition-colors cursor-pointer relative group">
            {user?.imageUrl ? (
              <>
                <AvatarImage
                  src={user.imageUrl}
                  alt={user?.name || user?.email || "User"}
                  className="object-cover"
                />
                {providerIcon && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border">
                    <img
                      src={providerIcon}
                      alt="Provider"
                      className="h-3 w-3"
                    />
                  </div>
                )}
              </>
            ) : (
              <AvatarFallback
                className={cn(
                  "bg-gradient-to-r font-medium text-white",
                  providerIcon ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-pink-500'
                )}
              >
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default User;
