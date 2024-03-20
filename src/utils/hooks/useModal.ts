/*
 * Hedera Claimbox NFT Claim Page
 *
 * Copyright (C) 2023 - 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { useContext } from 'react'
import { ModalContext, ModalTypes } from '../context/ModalContext';

export const useModal = (modalType: ModalTypes) => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  const isOpen = context.modalState[modalType] || false;

  const setModalState = (open: boolean) => {
    context.setModalState({
      ...context.modalState,
      [modalType]: open,
    });
  };
  const openModal = () => setModalState(true);
  const closeModal = () => setModalState(false);
  const switchModal = (type: ModalTypes) => {
    context.setModalState({
      [type]: true,
    });
  };
  const toggleModal = () => setModalState(!isOpen);

  return {
    modalOpen: isOpen,
    openModal,
    closeModal,
    switchModal,
    toggleModal,
    setModalState,
  };
};
