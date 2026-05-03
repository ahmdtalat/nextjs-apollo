import { Product } from '../app.types'

interface Props {
  products: Product[]
}

export default function ExampleProductList({ products }: Props) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id} className="p-2 bg-white">
          {product.id} - {product.name}
        </li>
      ))}
    </ul>
  )
}
