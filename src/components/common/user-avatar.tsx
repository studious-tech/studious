import { AvatarProps } from '@radix-ui/react-avatar'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/common/icons'

interface UserAvatarProps extends AvatarProps {
  user: {
    name?: string
    image?: string | null
    avatar_url?: string | null // Add support for avatar_url from profile
  }
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  // Use avatar_url from profile first, then fallback to image, then default
  const avatarSrc = user?.avatar_url || user?.image

  return (
    <Avatar {...props}>
      {avatarSrc ? (
        <AvatarImage alt="Picture" src={avatarSrc} referrerPolicy="no-referrer" />
      ) : (
        <AvatarFallback>
          {user?.name ? (
            <span className="font-medium">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </span>
          ) : (
            <>
              <span className="sr-only">{user?.name}</span>
              <Icons.user className="size-4" />
            </>
          )}
        </AvatarFallback>
      )}
    </Avatar>
  )
}
