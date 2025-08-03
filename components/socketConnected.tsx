import React, { useState, useEffect } from "react";
import { Loader, BadgeCheck } from "lucide-react";
import { clientConnected } from "@/actions/common/socketChecker";
import useAction from "@/hooks/useActions";
import { useParams } from "next/navigation";
import useGuestSession from "@/hooks/useGuestSession";

export default function SocketConnected() {
    const guestId = useGuestSession();
    const { tid } = useParams();
    const [status setStatus] = useState("");
    const [] = useAction(clientConnected,[,()=>{}]);
  return <div></div>;
}

 