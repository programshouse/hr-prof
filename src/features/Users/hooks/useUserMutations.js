import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  usersApi,
  usersKeys,
} from '../api/users.api';



export function useCreateUserMutation() {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn: usersApi.createUser,


    onSuccess: (response) => {

      toast.success(
        response?.message ||
        'User created successfully'
      );


      queryClient.invalidateQueries({
        queryKey: usersKeys.all,
      });

    },


    onError: (error) => {

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create user';


      toast.error(message);

    },

  });

}





export function useUpdateUserMutation() {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn: ({ id, data }) =>
      usersApi.updateUser(id, data),


    onSuccess: (response) => {

      toast.success(
        response?.message ||
        'User updated successfully'
      );


      queryClient.invalidateQueries({
        queryKey: usersKeys.all,
      });

    },


    onError: (error) => {

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update user';


      toast.error(message);

    },

  });

}





export function useDeleteUserMutation() {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn: usersApi.deleteUser,


    onSuccess: (response) => {

      toast.success(
        response?.message ||
        'User deleted successfully'
      );


      queryClient.invalidateQueries({
        queryKey: usersKeys.all,
      });

    },


    onError: (error) => {

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete user';


      toast.error(message);

    },

  });

}





export function useResetPasswordMutation() {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn: ({ id, data }) =>
      usersApi.resetPassword(id, data),


    onSuccess: (response) => {

      toast.success(
        response?.message ||
        'Password reset successfully'
      );


      queryClient.invalidateQueries({
        queryKey: usersKeys.all,
      });

    },


    onError: (error) => {

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset password';


      toast.error(message);

    },

  });

}





// ✅ Reset Fingerprint / Biometric

export function useResetFingerprintMutation() {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn: (id) =>
      usersApi.resetFingerprint(id),


    onSuccess: (response) => {

      toast.success(
        response?.message ||
        'Fingerprint reset successfully'
      );


      queryClient.invalidateQueries({
        queryKey: usersKeys.all,
      });

    },


    onError: (error) => {

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset fingerprint';


      toast.error(message);

    },

  });

}





// ✅ Reset Device

export function useResetDeviceMutation() {

  const queryClient = useQueryClient();


  return useMutation({

    mutationFn: (id) =>
      usersApi.resetDevice(id),


    onSuccess: (response) => {

      toast.success(
        response?.message ||
        'Device reset successfully'
      );


      queryClient.invalidateQueries({
        queryKey: usersKeys.all,
      });

    },


    onError: (error) => {

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset device';


      toast.error(message);

    },

  });

}