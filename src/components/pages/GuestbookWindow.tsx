import { Frame } from "react95";
import styled from "styled-components";
import { guestbookEntries } from "../../data/guestbookEntries";

const Wrapper = styled.div`
  padding: 16px;
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
`;

export function GuestbookWindow() {
  return (
    <Wrapper>
      <Title>📖 Guestbook 📖</Title>
      <Subtitle>
        ~*~ sign my guestbook!! leave a message below ~*~
      </Subtitle>
      <EntryList>
        {guestbookEntries.map((entry, i) => (
          <Entry key={i} variant="well">
            <EntryHeader>
              <EntryName>{entry.name}</EntryName>
              <EntryDate>{entry.date}</EntryDate>
            </EntryHeader>
            <EntryMessage>{entry.message}</EntryMessage>
          </Entry>
        ))}
      </EntryList>
    </Wrapper>
  );
}
