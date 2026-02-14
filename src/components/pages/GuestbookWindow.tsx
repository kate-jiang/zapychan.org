import { useState, useEffect, useCallback } from "react";
import { Frame, Button, TextInput } from "react95";
import styled from "styled-components";
import { Notepad } from "@react95/icons";

interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

const Wrapper = styled.div`
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const Title = styled.h2`
  color: #ff1493;
  margin: 0 0 12px 0;
  font-size: 18px;
  text-align: center;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 11px;
  margin: 0 0 16px 0;
  color: #d4578a;
`;

const FormFrame = styled(Frame)`
  padding: 12px;
  margin-bottom: 16px;
  box-sizing: border-box;
`;

const FormTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #ff1493;
  margin-bottom: 8px;
`;

const FieldRow = styled.div`
  margin-bottom: 8px;

  /* react95 TextInput wrapper doesn't use border-box, so force it */
  & > div {
    box-sizing: border-box;
  }
  & textarea,
  & input {
    box-sizing: border-box;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 11px;
  margin-bottom: 2px;
  color: #333;
`;

const CharCount = styled.span`
  font-size: 10px;
  color: #999;
  float: right;
`;

const FormFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusMessage = styled.span<{ $variant: "success" | "error" }>`
  font-size: 11px;
  color: ${(p) => (p.$variant === "success" ? "#2e8b57" : "#cc0000")};
`;

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Entry = styled(Frame)`
  padding: 12px;
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
`;

const EntryName = styled.span`
  font-weight: bold;
  color: #ff1493;
`;

const EntryDate = styled.span`
  color: #d4578a;
`;

const EntryMessage = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const LoadingText = styled.p`
  text-align: center;
  color: #d4578a;
  font-size: 12px;
`;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function GuestbookWindow() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      });

      if (res.ok) {
        const newEntry: GuestbookEntry = await res.json();
        setEntries((prev) => [newEntry, ...prev]);
        setName("");
        setMessage("");
        setStatus({ type: "success", text: "thanks for signing!! ~*~" });
      } else {
        const err = await res.json();
        setStatus({
          type: "error",
          text: err.error || "something went wrong :(",
        });
      }
    } catch {
      setStatus({ type: "error", text: "couldn't connect to server :(" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Title>
        <Notepad
          variant="16x16_4"
          style={{ verticalAlign: "middle", marginRight: 4 }}
        />{" "}
        Guestbook{" "}
        <Notepad
          variant="16x16_4"
          style={{ verticalAlign: "middle", marginLeft: 4 }}
        />
      </Title>
      <Subtitle>~*~ sign my guestbook!! leave a message below ~*~</Subtitle>

      <FormFrame variant="well">
        <FormTitle>~ Sign the Guestbook ~</FormTitle>
        <FieldRow>
          <Label>
            Name: <CharCount>{name.length}/30</CharCount>
          </Label>
          <TextInput
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value.slice(0, 30))
            }
            placeholder="your name~"
            fullWidth
            disabled={submitting}
          />
        </FieldRow>
        <FieldRow>
          <Label>
            Message: <CharCount>{message.length}/500</CharCount>
          </Label>
          <TextInput
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(e.target.value.slice(0, 500))
            }
            placeholder="leave a message! ~*~"
            multiline
            rows={3}
            fullWidth
            disabled={submitting}
          />
        </FieldRow>
        <FormFooter>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !message.trim()}
          >
            {submitting ? "Signing..." : "Sign!"}
          </Button>
          {status && (
            <StatusMessage $variant={status.type}>{status.text}</StatusMessage>
          )}
        </FormFooter>
      </FormFrame>

      {loading ? (
        <LoadingText>loading entries...</LoadingText>
      ) : entries.length === 0 ? (
        <LoadingText>no entries yet~ be the first to sign!</LoadingText>
      ) : (
        <EntryList>
          {entries.map((entry) => (
            <Entry key={entry.id} variant="well">
              <EntryHeader>
                <EntryName>{entry.name}</EntryName>
                <EntryDate>{formatDate(entry.created_at)}</EntryDate>
              </EntryHeader>
              <EntryMessage>{entry.message}</EntryMessage>
            </Entry>
          ))}
        </EntryList>
      )}
    </Wrapper>
  );
}
