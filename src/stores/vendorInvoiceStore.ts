import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { 
  PriceChange, 
  CodeChange, 
  VendorInvoiceStats 
} from '@/types/vendor-invoice';
import toast from 'react-hot-toast';

interface VendorInvoiceStore {
  priceChanges: PriceChange[];
  codeChanges: CodeChange[];
  stats: VendorInvoiceStats;
  isLoading: boolean;
  error: string | null;
  fetchInvoiceData: (vendorId: string) => Promise<void>;
  savePriceChanges: (changes: PriceChange[]) => Promise<void>;
  saveCodeChanges: (changes: CodeChange[]) => Promise<void>;
  approvePriceChange: (changeId: string) => Promise<void>;
  rejectPriceChange: (changeId: string) => Promise<void>;
  handleCodeChange: (changeId: string, action: 'update' | 'new_item') => Promise<void>;
}

export const useVendorInvoiceStore = create<VendorInvoiceStore>((set, get) => ({
  priceChanges: [],
  codeChanges: [],
  stats: {
    itemsToUpdate: 0,
    averageChange: 0,
    potentialSavings: 0,
    issueCount: 0
  },
  isLoading: false,
  error: null,

  fetchInvoiceData: async (vendorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const [priceChangesRes, codeChangesRes] = await Promise.all([
        supabase
          .from('vendor_price_changes')
          .select('*')
          .eq('organization_id', user.user_metadata.organizationId)
          .eq('vendor_id', vendorId)
          .order('invoice_date', { ascending: false }),
        supabase
          .from('vendor_code_changes')
          .select('*')
          .eq('organization_id', user.user_metadata.organizationId)
          .eq('vendor_id', vendorId)
          .order('invoice_date', { ascending: false })
      ]);

      if (priceChangesRes.error) throw priceChangesRes.error;
      if (codeChangesRes.error) throw codeChangesRes.error;

      set({ 
        priceChanges: priceChangesRes.data,
        codeChanges: codeChangesRes.data,
        error: null 
      });
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      set({ error: 'Failed to load invoice data' });
    } finally {
      set({ isLoading: false });
    }
  },

  savePriceChanges: async (changes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('vendor_price_changes')
        .upsert(
          changes.map(change => ({
            organization_id: user.user_metadata.organizationId,
            ...change
          }))
        );

      if (error) throw error;
      set({ priceChanges: changes });
      toast.success('Price changes saved successfully');
    } catch (error) {
      console.error('Error saving price changes:', error);
      toast.error('Failed to save price changes');
    }
  },

  saveCodeChanges: async (changes) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('vendor_code_changes')
        .upsert(
          changes.map(change => ({
            organization_id: user.user_metadata.organizationId,
            ...change
          }))
        );

      if (error) throw error;
      set({ codeChanges: changes });
      toast.success('Code changes saved successfully');
    } catch (error) {
      console.error('Error saving code changes:', error);
      toast.error('Failed to save code changes');
    }
  },

  approvePriceChange: async (changeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('vendor_price_changes')
        .update({
          approved: true,
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', changeId)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        priceChanges: state.priceChanges.map(change =>
          change.id === changeId
            ? { ...change, approved: true, approvedBy: user.id, approvedAt: new Date().toISOString() }
            : change
        )
      }));

      toast.success('Price change approved');
    } catch (error) {
      console.error('Error approving price change:', error);
      toast.error('Failed to approve price change');
    }
  },

  rejectPriceChange: async (changeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('vendor_price_changes')
        .update({
          rejected_by: user.id,
          rejected_at: new Date().toISOString()
        })
        .eq('id', changeId)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        priceChanges: state.priceChanges.map(change =>
          change.id === changeId
            ? { ...change, rejectedBy: user.id, rejectedAt: new Date().toISOString() }
            : change
        )
      }));

      toast.success('Price change rejected');
    } catch (error) {
      console.error('Error rejecting price change:', error);
      toast.error('Failed to reject price change');
    }
  },

  handleCodeChange: async (changeId, action) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.user_metadata?.organizationId) {
        throw new Error('No organization ID found');
      }

      const { error } = await supabase
        .from('vendor_code_changes')
        .update({
          handled: true,
          handled_by: user.id,
          handled_at: new Date().toISOString(),
          action
        })
        .eq('id', changeId)
        .eq('organization_id', user.user_metadata.organizationId);

      if (error) throw error;

      set(state => ({
        codeChanges: state.codeChanges.map(change =>
          change.id === changeId
            ? { 
                ...change, 
                handled: true, 
                handledBy: user.id, 
                handledAt: new Date().toISOString(),
                action 
              }
            : change
        )
      }));

      toast.success('Code change handled successfully');
    } catch (error) {
      console.error('Error handling code change:', error);
      toast.error('Failed to handle code change');
    }
  }
}));