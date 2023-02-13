
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

export const TextArea = styled.textarea`
  width: 50%;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 20px;
`;

export const Button = styled.button`
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #3e8e41;
  }
`;

export const Content = styled.div`
  width: 50%;
  margin-top: 20px;
  padding: 20px;
  background-color: #f2f2f2;
  border-radius: 5px;
  color: black;
  font-family: 'Arial';
`;

export const StringLength = styled.p`
  margin-top: 20px;
  font-size: 18px;
  font-family: 'Arial';
`;