import { PostForm } from "@/components/admin/content-forms";
import { PageHeader } from "@/components/admin/page-header";

export default function NewPostPage() {
  return (
    <>
      <PageHeader
        title="New article"
        description="Write a draft and publish it when it is ready for visitors."
        backHref="/admin/posts"
      />
      <PostForm />
    </>
  );
}
