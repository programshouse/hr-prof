"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function UserCard({ name, jobTitle, avatarSrc }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg w-fit">
      <Avatar className="size-14">
        <AvatarImage src={avatarSrc} alt={name} />
        <AvatarFallback>
          {name ? name.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <span className=" font-medium text-sm text-main">{name}</span>
        <span className="text-sm font-medium text-Black">{jobTitle}</span>
      </div>
    </div>
  );
}

export default UserCard;
